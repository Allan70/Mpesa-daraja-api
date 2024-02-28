# M-pesa Daraja API (NPM Package )

This is an npm package intended to streamline the process of adding the M-Pesa Daraja API to your project.


M-Pesa is like a digital wallet on your phone that lets you send and receive money, pay for things, and even borrow small amounts of money. It works through text messages and is used a lot in Africa. You can use it without needing a bank account, and there are people called agents who help you turn cash into digital money and back again. It's super handy because you can do all these things using just your phone, even if you don't have internet.


## M-Pesa Online Paybill
In order to make a JSON based API call to the **Safaricom 2.0 Daraja API** 

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

## Receive Transaction Information (Receipts)

Upon making a successful transaction with the Daraja API 2.0 at least with the PayBill the resulting API receipt can be received via a POST request to the callback url.
This can be invoked by calling the ```getTransactionInfo()``` function.
this can be done with 2 lines of code.

First off you will import the object named ```transaction```.
```JS
  const transaction = require('./transaction');
```

Next you will call the functionby setting the request from the previous function as its argument.
```JS
    transaction.getTransactionInfo(req)
```

That is it. When done right you will have someting that looks a little like this.
```JS
app.get("/def_callback", async (req, res) => {

    const transaction = require('./transaction');

    res.send(transaction.getTransactionInfo(req));

});
```



