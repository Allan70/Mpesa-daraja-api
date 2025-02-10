# M-pesa API npm package

This is an npm package intended to streamline the process of adding the M-Pesa Daraja API to your project.

M-Pesa is like a digital wallet on your phone that lets you send and receive money, pay for things, and even borrow small amounts of money. It works through text messages and is used a lot in Africa.

You can use it without needing a bank account, and there are people called agents who help you turn cash into digital money and back again.

It's super handy because you can do all these things using just your phone, even if you don't have internet.

The following package allows a developer to interact with M-Pesa's transaction API to allow Software to make mobile payments. The package only supports `NodeJS` for now. More updates are to be made.

## Installing the package

Install the package into your project you can find the npm package here.

```sh

npm install daraja-package


```

## Importing the package into your Project

To add the package to your project you can use the following import statement

```js

import Mpesa from "daraja-package"


```

## Usage

After importing the package into your project you can access the API by following these steps.

```js
import mpesa from "daraja-package";
import * as dotenv from "dotenv"
dotenv.config()

// Call the package
const mobilePay = mpesa({
    callbackURL: "https://example.com",
    consumerSecret: process.env.CONSUMER_SECRET,
    consumerKey: process.env.CONSUMER_KEY,
    passKey: process.env.PASS_KEY,
    mpesaBaseUrl: "DEV"
})

await mobilePay.express({
            phone: "712345678",
            amount: "20", //KES
            tillOrPayBillNumber: "174379", // TILLNUMBER OR BUSINESS NUMBER
            account_reference: "Volant Digital LTD", 
            transaction_desc: "Buying Apples"
        }).then((result)=>{
            console.log(result)
        }).catch((error)=>{
            console.error(error)
        });

```

NOTE: Rember to start a sandbox if you wish to test the API in a developer environment.

# callbackURL  : URL

URL that will be called once payment call has been made (Successful payment web page/screen)

A CallBack URL is a valid secure URL that is used to receive notifications from M-Pesa API. It is the endpoint to which the results will be sent by M-Pesa API.

https://ip or domain:port/path

e.g: https://mydomain.com/path

https://0.0.0.0:9090/path

# consumerSecret

M-Pesa API `Consumer Secret`

# consumerKey

M-Pesa API product `Consumer Key`

# mpesaBaseUrl

Choosing the base url between the `DEV` which uses m-pesa sandbox url and `PRODUCTOPM` which uses the live mpesa api url.

The default url will be the M-pesa sandbox url if the option is left blank.

# phone

Mobile phone number to be credited the amount.

# amount

Amount to be paid via the API call

#  tillOrPayBillNumber

Either a till number or a paybill number

# account_reference

Account Reference: This is an Alpha-Numeric parameter that is defined by your system as an Identifier of the transaction for the CustomerPayBillOnline transaction type. Along with the business name, this value is also displayed to the customer in the STK Pin Prompt message. Maximum of 12 characters.

# transaction_desc

This is any additional information/comment that can be sent along with the request from your system. Maximum of 13 Characters.



