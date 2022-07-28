const express = require('express');
const cors = require('cors');
const {
    default: axios
} = require('axios');

// configure .env files
require('dotenv').config();

const app = express();
const port = process.env.PORT;

// App rinning and listening to port
app.listen(port, () => {
    console.log(`App is running in localhost ${port}`);
});

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
app.use(cors());

app.get("/", (req, res) => {
    res.send("<h1>Hello from Pentecost</h1>");
});

// // Test for getting the token
// app.get("/token", (req, res) => {
//     generateToken();
// });

// Middleware to generate token
const generateToken = async (req, res, next) => {

    const secret = process.env.MPESA_SECRET_KEY;
    const consumerKey = process.env.MPESA_CONSUMER_KEY;

    const auth = new Buffer.from(`${consumerKey}:${secret}`).toString("base64");

    await axios.get("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
        headers: {
            "Authorization": `Basic ${auth}`
        },
    }).then((response) => {
        // console.log(response.data.access_token);
        const token = response.data.access_token;
        next();
    }).catch((err) => {
        console.log(err);
        res.status(400).json(err.message);
    })
}


app.post("/stk", generateToken, async (req, res) => {
    const phoneNumber = req.body.phone.sibstring(-1); //ensure it starts with 254 eg. 254708374149
    const amount = req.body.amount;

    const businessNumber = process.env.MPESA_PAYBILL; //your paybill/tillnumber
    const tillNumber = process.env.MPESA_TILL; //your paybill/tillnumber
    const mpesaPassword = process.env.MPESA_PASSWORD; //your paybill/tillnumber

    const merchantEndPoint = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest'; // change the sandbox to api during production
    const callBackURL = "https://mydomain.com/pat";

    const timestamp =
        date.getFullYear() +
        ("0" + (date.getMonth() + 1)).slice(-2) +
        ("0" + date.getDate()).slice(-2) +
        ("0" + date.getHours()).slice(-2) +
        ("0" + getMinutes()).slice(-2) +
        ("0" + date.getSeconds()).slice(-2);

    const password = new Buffer.from(businessNumber + mpesaPassword + timestamp).toString("base64");

    const darajaRequestBody = {
        "BusinessShortCode": tillNumber,
        "Password": password,
        "Timestamp": timestamp,
        "TransactionType": "CustomerBuyGoodsOnline", //CustomerPayBillOnline(for Paybill) - CustomerBuyGoodsOnline(for till number)
        "Amount": amount,
        "PartyA": `254${phoneNumber}`,
        "PartyB": tillNumber,
        "PhoneNumber": `254${phoneNumber}`,
        "CallBackURL": callBackURL,
        "AccountReference": `254${phoneNumber}`,
        "TransactionDesc": "Test" //Enter your randomly generated ticket numbers here.
    };

    await axios.post(
        merchantEndPoint,
        darajaRequestBody, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    ).then((data) => {
        console.log(data);
        res.status(200).json(data)
    }).catch((e) => {
        console.log(e.message);
        res.status(400).json(err.message);
    });
});