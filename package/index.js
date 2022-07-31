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
    const mpesa_paybill = require('./mpesa_paybill');
    const payBillBody = {
        "phoneNumber": req.body.phone,
        "amountFromUser": req.body.amount,
        "businessNumber": req.body.payBillNumber,
        "mpesaPassword": req.body.mpesaPassword,
        "callback_URL": req.body.callbackURL,
        "account_reference": req.body.account_reference,
        "transaction_desc": req.body.transaction_desc
    };

    mpesa_paybill(payBillBody);
});

// buy goods
app.post("/buy_goods", generateToken, async (req, res) => {
    const mpesa_buy_goods = require('./mpesa_paybill');
    const buyGoodsBody = {
        "phoneNumber": req.body.phone,
        "amountFromUser": req.body.amount,
        "businessNumber": req.body.payBillNumber,
        "mpesaPassword": req.body.mpesaPassword,
        "callback_URL": req.body.callbackURL,
        "account_reference": req.body.account_reference,
        "transaction_desc": req.body.transaction_desc
    };

    mpesa_buy_goods(buyGoodsBody);
});

// default callback url to receive transactions
app.get("/def_callback", async (req, res) => {
    const transaction = require('./transaction');
    res.send(transaction.getTransactionInfo(req));
});