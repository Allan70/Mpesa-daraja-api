const express = require('express');
const cors = require('cors');
const axios = require('axios');

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
        token = response.data.access_token;
        next();
    }).catch((err) => {
        console.log(err);
        res.status(400).json(err.message);
    })
}


app.post("/stk", generateToken, async (req, res) => {
    const date = new Date();

    const phoneNumber = req.body.phone; //ensure it starts with 254 eg. 254708374149
    const amount = req.body.amount;

    const businessNumber = process.env.MPESA_PAYBILL; //your paybill
    const tillNumber = process.env.MPESA_TILL; //your tillnumber
    const mpesaPassword = process.env.MPESA_PASSWORD;

    const merchantEndPoint = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest'; // change the sandbox to api during production
    const callBackURL = "https://mydomain.com/path";

    const timestamp = (
        date.getFullYear() +
        ("0" + (date.getMonth() + 1)).slice(-2) +
        ("0" + date.getDate()).slice(-2) +
        ("0" + date.getHours()).slice(-2) +
        ("0" + date.getMinutes()).slice(-2) +
        ("0" + date.getSeconds()).slice(-2)
    );

    const pass = (businessNumber + mpesaPassword + timestamp);

    console.log(pass);
    const passwordSaf = btoa(pass);

    console.log(passwordSaf);

    console.log("MTc0Mzc5YmZiMjc5ZjlhYTliZGJjZjE1OGU5N2RkNzFhNDY3Y2QyZTBjODkzMDU5YjEwZjc4ZTZiNzJhZGExZWQyYzkxOTIwMjIwNzI4MjEzNTE4")
    const darajaRequestBody = {
        "BusinessShortCode": parseInt(businessNumber),
        "Password": passwordSaf,
        "Timestamp": timestamp,
        "TransactionType": "CustomerPayBillOnline", //CustomerPayBillOnline(for Paybill) - CustomerBuyGoodsOnline(for till number)
        "Amount": parseInt(amount),
        "PartyA": parseInt(`254${phoneNumber}`),
        "PartyB": parseInt(businessNumber),
        "PhoneNumber": parseInt(`254${phoneNumber}`),
        "CallBackURL": callBackURL,
        "AccountReference": "CompanyXLTD", //`254${phoneNumber}`
        "TransactionDesc": "Payment of X" //Enter your randomly generated ticket numbers here.
    }

    let unirest = require('unirest');
    let request = unirest('POST', 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest').headers({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    }).send(darajaRequestBody).end(res => {
        if (res.error)
            console.log(res.error);
        console.log(res.raw_body);
    });
});


