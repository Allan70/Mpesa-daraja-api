const mpesa_buy_goods = (buyGoodsBody) => {
    try{

        const phoneNumber = buyGoodsBody.phoneNumber; //Make sure it starts with 254 eg. +254708374149
        const amountFromUser = buyGoodsBody.amountFromUser;
        const businessNumber = buyGoodsBody.businessNumber; //your paybill
        const mpesaPassword = buyGoodsBody.mpesaPassword;
        const merchantEndPoint = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest'; // change the sandbox to api during production
        const callBackURL = buyGoodsBody.callback_URL;
    
        const timestamp = require('./timestamp')
    
        const pass = (businessNumber + mpesaPassword + timestamp);
    
    
        const passwordSaf = btoa(pass);
    
        const darajaRequestBody = {
            "BusinessShortCode": parseInt(businessNumber),
            "Password": passwordSaf,
            "Timestamp": timestamp,
            "TransactionType": "CustomerBuyGoodsOnline", 
            "Amount": parseInt(amountFromUser),
            "PartyA": parseInt(`254${phoneNumber}`),
            "PartyB": parseInt(businessNumber),
            "PhoneNumber": parseInt(`254${phoneNumber}`),
            "CallBackURL": callBackURL,
            "AccountReference": (buyGoodsBody.account_reference), //`254${phoneNumber}`
            "TransactionDesc": (buyGoodsBody.transaction_desc) //Enter your randomly generated ticket numbers here.
        }
    
        let unirest = require('unirest');
        return request = unirest('POST', merchantEndPoint).headers({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }).send(darajaRequestBody).end(res => {
            if (res.error)
                console.log(res.error);
            console.log(res.raw_body);
        });
    }catch(error){
        console.error(error)
    }

};

module.exports = mpesa_buy_goods;