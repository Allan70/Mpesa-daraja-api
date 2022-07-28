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


    // Middleware to generate token
const generateToken = (req, res, next)=>{
    console.log(body)
}

app.post("/stk", generateToken,async (req, res) => {
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

    const password = new Buffer.from(businessNumber + mpesaPassword + timestamp ).toString("base64");

    const darajaRequestBody = {
        "BusinessShortCode": tillNumber,
        "Password": password,
        "Timestamp": timestamp,
        "TransactionType": "CustomerBuyGoodsOnline",//CustomerPayBillOnline(for Paybill) - CustomerBuyGoodsOnline(for till number)
        "Amount": amount,
        "PartyA":`254${phoneNumber}`,
        "PartyB": tillNumber,
        "PhoneNumber": `254${phoneNumber}`,
        "CallBackURL": callBackURL,
        "AccountReference": `254${phoneNumber}`,
        "TransactionDesc": "Test"
    };

    await axios.post(
        merchantEndPoint,
        darajaRequestBody, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
});