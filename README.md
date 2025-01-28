# M-pesa API npm package (Testing phase)

This is an npm package intended to streamline the process of adding the M-Pesa Daraja API to your project.

M-Pesa is like a digital wallet on your phone that lets you send and receive money, pay for things, and even borrow small amounts of money. It works through text messages and is used a lot in Africa. 

You can use it without needing a bank account, and there are people called agents who help you turn cash into digital money and back again. 

It's super handy because you can do all these things using just your phone, even if you don't have internet.

The following package allows a developer to interact with M-Pesa's transaction API to allow Software to make mobile payments. The package only supports `NodeJS` for now. More updates are to be made.

## Installing the package

Install the package into your project

```sh

npm install mpesa-daraja-api

```

## Importing the package into your Project 

To add the package to your project you can use the following import statement

```js

import Mpesa from "mpesa-daraja-api"

```

## Usage

After importing the package into your project you can access the API by following these steps.

```js
// Call the package
const mpesa = Mpesa({callbackURL, secret, consumer_key, mpesa_base_url});

/** 
 * Asynchronous methods making API calls under the hood
 *
 * */

// Make payment using M-Pesa paybill 
await mpesa.paybill({phone, amount, payBillNumber, account_reference, transaction_desc});

//Make Payment using M-Pesa Till number
await mpesa.buyGoods({phone, amount, tillNumber, account_reference, transaction_desc});

```

NOTE: Rember to start a sandbox if you wish to test the API in a developer environment.

# callbackURL  : URL
URL that will be called once payment call has been made (Successful payment web page/screen)

A CallBack URL is a valid secure URL that is used to receive notifications from M-Pesa API. It is the endpoint to which the results will be sent by M-Pesa API.

	
https://ip or domain:port/path

e.g: https://mydomain.com/path

https://0.0.0.0:9090/path

# secret 
M-Pesa API `Consumer Secret` 

# consumer_key 
M-Pesa API product `Consumer Key`


# mpesa_base_url  
Choosing the base url between the `mpesa sandbox url` and `mpesa production url`.

The default url will be the M-pesa sandbox url if the option is left blank.

# phone 
Mobile phone number to be credited the amount.

# amount 
Amount to be paid via the API call

# payBillNumber 
Paybill number to be debited the amount

# Till Number 
Till number to be debited the amount

# account_reference	
Account Reference: This is an Alpha-Numeric parameter that is defined by your system as an Identifier of the transaction for the CustomerPayBillOnline transaction type. Along with the business name, this value is also displayed to the customer in the STK Pin Prompt message. Maximum of 12 characters.

# transaction_desc	
This is any additional information/comment that can be sent along with the request from your system. Maximum of 13 Characters.



