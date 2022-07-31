# Mpesa-daraja-api NPM Package 

Implementing M-Pesa Daraja API with NodeJS package.
- [ ] Add Africas Talking API to return specified company messages
- [ ] Perform online payments with PayBill
- [ ] Perform online payments with Lipa na M-Pesa

## M-Pesa Online Paybill
In order to make a JSON based API call to the **Safaricom 2.0 Daraja API**.

The prototype of the package is consumed as a JSON. The function ```mpesa_paybill()``` accepts a json object for our example it will be called ```payBillBody``` the JSON has all the relevant details to make a call to the **Safaricom Daraja 2.0 API** .

We begin by requiring the ```mpesa_paybill()``` function.

```JS
    const mpesa_paybill = require('./mpesa_paybill');
 ```
 
 Then we will create a JSON body that will contain the fields labelled below. 
 - phoneNumber
 - amountFromUser
 - businessNumber
 - mpesaPassword
 - callback_URL
 - account_reference
 - transaction_desc
 
 ```JS
    const payBillBody = {
        "phoneNumber": req.body.phone,
        "amountFromUser": req.body.amount,
        "businessNumber": req.body.payBillNumber,
        "mpesaPassword": req.body.mpesaPassword,
        "callback_URL": req.body.callbackURL,
        "account_reference": req.body.account_reference,
        "transaction_desc": req.body.transaction_desc
    };
```
Finally, insert the JSON variable to the ```mpesa_paybill()``` function. That will look something like this.
```JS
    mpesa_paybill(payBillBody);
```

When we combine everything it will look something like this.

```JS
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
```


