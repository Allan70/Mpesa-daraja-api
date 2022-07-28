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

// Paybill
app.post("/paybill", generateToken, async (req, res) => {
    const phoneNumber = req.body.phone; //ensure it starts with 254 eg. 254708374149
    const amountFromUser = req.body.amount;

    const mpesa_paybill = require('./mpesa_paybill');

    mpesa_paybill(phoneNumber, amountFromUser);

});

// buy goods
app.post("/buy_goods", generateToken, async (req, res) => {
    const phoneNumber = req.body.phone; //ensure it starts with 254 eg. 254708374149
    const amountFromUser = req.body.amount;
    const tillNumber = req.body.tillNumber || process.env.MPESA_TILL;

    const mpesa_buy_goods = require('./mpesa_buy_goods');

    mpesa_buy_goods(phoneNumber, amountFromUser, tillNumber);

});

// default callback url
app.post("/default_callback", generateToken, async (req, res) => {
    // receives the body object from the user.

    const requestBody = req.body;
    const metaData = req.body.Body.stkCallback.CallbackMetadata;

    console.log(requestBody);
    console.log(metaData);

    const receipt = {
        "Amount": metaData.Item[0].Value,
        "mpesaReceiptNumber": metaData.Item[1].Value,
        "transactionDate": metaData.Item[2].Value,
        "phoneNumber": metaData.Item[3].Value
    }

    // Receipt data 
    console.log(receipt);

});