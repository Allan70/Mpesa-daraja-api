const mpesa_buy_goods = (phone, amount, tillNumber)=>{
    const phoneNumber = phone; //ensure it starts with 254 eg. 254708374149
    const amountFromUser = amount;

    const tillNumber = tillNumber; //your paybill
    const mpesaPassword = process.env.MPESA_PASSWORD;

    const merchantEndPoint = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest'; // change the sandbox to api during production
    const callBackURL = "https://mydomain.com/path";

    //  import timestamp
    const timestamp = require('./timestamp')

    const pass = (tillNumber + mpesaPassword + timestamp);


    const passwordSaf = btoa(pass);

    const darajaRequestBody = {
        "BusinessShortCode": parseInt(tillNumber),
        "Password": passwordSaf,
        "Timestamp": timestamp,
        "TransactionType": "CustomerBuyGoodsOnline", //CustomerPayBillOnline(for Paybill) - CustomerBuyGoodsOnline(for till number)
        "Amount": parseInt(amountFromUser),
        "PartyA": parseInt(`254${phoneNumber}`),
        "PartyB": parseInt(tillNumber),
        "PhoneNumber": parseInt(`254${phoneNumber}`),
        "CallBackURL": callBackURL,
        "AccountReference": "CompanyXLTD", //`254${phoneNumber}`
        "TransactionDesc": "Payment of X" //Enter your randomly generated ticket numbers here.
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

};

module.exports = mpesa_buy_goods;