# M-pesa API npm package (Testing phase)

This is an npm package intended to streamline the process of adding the M-Pesa Daraja API to your project.
M-Pesa is like a digital wallet on your phone that lets you send and receive money, pay for things, and even borrow small amounts of money. It works through text messages and is used a lot in Africa.

You can use it without needing a bank account, and there are people called agents who help you turn cash into digital money and back again.
It's super handy because you can do all these things using just your phone, even if you don't have an internet connection.

The following package allows a developer to interact with M-Pesa's transaction API to allow Software to make mobile payments. The package only supports `NodeJS` for now. More updates are to be made.

You need to create an application at the [daraja API](https://developer.safaricom.co.ke/) platform first before you can use the following package.

> Daraja API requires requests to be made from a secure HTTPS TLS connection.

We recommend using [ngrok](https://ngrok.com/docs/guides/developer-preview/getting-started/) to achieve a TLS connection on your device.

For windows you can use

```sh
choco install ngrok
```
For mac OS
```sh
brew install ngrok
```

For Linux use APT
```sh
curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | \
  sudo gpg --dearmor -o /etc/apt/keyrings/ngrok.gpg && \
  echo "deb [signed-by=/etc/apt/keyrings/ngrok.gpg] https://ngrok-agent.s3.amazonaws.com buster main" | \
  sudo tee /etc/apt/sources.list.d/ngrok.list && \
  sudo apt update && sudo apt install ngrok
```

To check whether you have ngrok installed you can run the following command
```sh
ngrok -h
```

Ngrok uses an auth token, that requires it's CLI users to log into the `ngrok` platform. You must have an account on [ngrok](https://ngrok.com).

Run this command to add the authtoken to your terminal.

```sh
ngrok config add-authtoken TOKEN
```

## Starting the Ngrok package
```sh
ngrok http 8000
```

Now open the Forwarding URL in your browser and you should see your local web service. At first glance, it may not seem impressive, but there are a few key differences here:

That URL is available to anyone in the world. Seriously, test it out by sending it to a friend.
You are now using TLS (notice the 🔒 in your browser window) with a valid certificate without making any changes to your local service.


## Installing daraja-package

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
// Call the package
const mpesa = Mpesa({callbackURL, secret, consumer_key, mpesa_base_url});

// Make payment using M-Pesa paybill 
await mpesa.paybill({phone, amount, payBillNumber, account_reference, transaction_desc});

//Make Payment using M-Pesa Till number
await mpesa.buyGoods({phone, amount, tillNumber, account_reference, transaction_desc});
```

NOTE: Rember to start a sandbox if you wish to test the API in a developer environment.

## CallbackURL
URL that will be called once payment call has been made (Successful payment web-page-screen)

A CallBack URL is a valid secure URL that is used to receive notifications from M-Pesa API. It is the endpoint to which the results will be sent by M-Pesa API.

https://ip or domain:port/path

e.g: https://mydomain.com/path

https://0.0.0.0:9090/path

## Secret
M-Pesa API `Consumer Secret`

### Consumer_key
M-Pesa API product `Consumer Key`

## Mpesa_base_url
Choosing the base url between the `mpesa sandbox url` and `mpesa production url`.

The default url will be the M-pesa sandbox url if the option is left blank.

## Phone
Mobile phone number to be credited the amount.

## Amount
Amount to be paid via the API call

## PayBill Number
Paybill number to be debited the amount

## Till Number
Till number to be debited the amount

## Account Reference
Account Reference: This is an Alpha-Numeric parameter that is defined by your system as an Identifier of the transaction for the CustomerPayBillOnline transaction type. Along with the business name, this value is also displayed to the customer in the STK Pin Prompt message. Maximum of 12 characters.

## Transaction Desc
This is any additional information/comment that can be sent along with the request from your system. Maximum of 13 Characters.



