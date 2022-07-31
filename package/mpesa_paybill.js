const mpesa_paybill = (paybillbody) => {
    const phoneNumber = paybillbody.phoneNumber; //ensure it starts with 254 eg. 254708374149
    const amountFromUser = paybillbody.amountFromUser;
    const businessNumber = paybillbody.businessNumber; //your paybill
    const mpesaPassword = paybillbody.mpesaPassword;
    const merchantEndPoint = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest'; // change the sandbox to api during production
    const callBackURL = paybillbody.callback_URL;

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
        "AccountReference": (paybillbody.account_reference), //`254${phoneNumber}`
        "TransactionDesc": (paybillbody.transaction_desc) //Enter your randomly generated ticket numbers here.
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

module.exports = mpesa_paybill;