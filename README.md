# M-pesa API npm package

This is an npm package intended to streamline the process of adding the M-Pesa Daraja API to your project.
M-Pesa is like a digital wallet on your phone that lets you send and receive money, pay for things, and even borrow small amounts of money. It works through text messages and is used a lot in Africa.

You can use it without needing a bank account, and there are people called agents who help you turn cash into digital money and back again.
It's super handy because you can do all these things using just your phone, even if you don't have an internet connection.

The following package allows a developer to interact with M-Pesa's transaction API to allow Software to make mobile payments. The package only supports `NodeJS` for now. More updates are to be made.

You need to create an application at the [daraja API](https://developer.safaricom.co.ke/) platform first before you can use the following package.

![rft0x1qn](https://github.com/user-attachments/assets/59190850-e628-4c2f-9827-adce977be9be)

![image](https://github.com/user-attachments/assets/89a41616-a7cd-491e-966b-374ead92198b)

![image](https://github.com/user-attachments/assets/d0f9b95e-dbad-42f6-b80c-9323a954a5bb)

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
            account_reference: "Business/Company Name", 
            transaction_desc: "Buying apples and oranges"
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



