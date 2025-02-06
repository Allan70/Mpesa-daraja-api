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

// Middleware to generate token
const generateToken = require('./generateToken');

// Paybill
app.post("/paybill", generateToken, async (req, res) => {
    try{
        const {phone, amount, payBillNumber, mpesaPassword, callbackURL, account_reference, transaction_desc } = req.body
    
        const mpesa_paybill = require('./mpesa_paybill');
        const payBillBody = {
            "phoneNumber": phone,
            "amountFromUser": amount,
            "businessNumber": payBillNumber,
            "mpesaPassword": mpesaPassword,
            "callback_URL": callbackURL,
            "account_reference": account_reference,
            "transaction_desc": transaction_desc
        };
    
        mpesa_paybill(payBillBody);
    }catch(error){
        res.status(400).json({error: error})
    }
});

// buy goods
app.post("/buy_goods", generateToken, async (req, res) => {
    try{
        const {phone, amount, payBillNumber, mpesaPassword, callbackURL, account_reference, transaction_desc } = req.body
        const mpesa_buy_goods = require('./mpesa_paybill');
        const buyGoodsBody = {
            "phoneNumber": phone,
            "amountFromUser": amount,
            "businessNumber": payBillNumber,
            "mpesaPassword": mpesaPassword,
            "callback_URL": callbackURL,
            "account_reference": account_reference,
            "transaction_desc": transaction_desc
        };
    
        mpesa_buy_goods(buyGoodsBody);
    }catch(error){
        console.error(error)
    }
});

// default callback url to receive transactions
app.get("/def_callback", async (req, res) => {
    try{
        const transaction = require('./transaction');
        res.send(transaction.getTransactionInfo(req));
    } catch (error){
        console.error(error)
    }
});