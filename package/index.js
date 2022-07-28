const express = require('express');
const cors = require('cors');

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
const generateToken = require('./generateToken');


app.post("/paybill", generateToken, async (req, res) => {
    const phoneNumber = req.body.phone; //ensure it starts with 254 eg. 254708374149
    const amountFromUser = req.body.amount;

    const businessNumber = process.env.MPESA_PAYBILL; //your paybill
    const mpesaPassword = process.env.MPESA_PASSWORD;

    const merchantEndPoint = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest'; // change the sandbox to api during production
    const callBackURL = "https://mydomain.com/path";

    //  import timestamp
    const timestamp = require('./timestamp')

    const pass = (businessNumber + mpesaPassword + timestamp);


    const passwordSaf = btoa(pass);

    const darajaRequestBody = {
        "BusinessShortCode": parseInt(businessNumber),
        "Password": passwordSaf,
        "Timestamp": timestamp,
        "TransactionType": "CustomerPayBillOnline", //CustomerPayBillOnline(for Paybill) - CustomerBuyGoodsOnline(for till number)
        "Amount": parseInt(amountFromUser),
        "PartyA": parseInt(`254${phoneNumber}`),
        "PartyB": parseInt(businessNumber),
        "PhoneNumber": parseInt(`254${phoneNumber}`),
        "CallBackURL": callBackURL,
        "AccountReference": "CompanyXLTD", //`254${phoneNumber}`
        "TransactionDesc": "Payment of X" //Enter your randomly generated ticket numbers here.
    }

    let unirest = require('unirest');
    let request = unirest('POST', merchantEndPoint).headers({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    }).send(darajaRequestBody).end(res => {
        if (res.error)
            console.log(res.error);
        console.log(res.raw_body);
        console.log(res.Body);
    });
});


