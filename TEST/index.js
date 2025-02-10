// const mpesa = require("daraja-package");
import mpesa from "daraja-package";
import * as dotenv from "dotenv"
dotenv.config()

const mobilePay = mpesa({
    callbackURL: "https://mydomain.com/b2b/result/",
    consumerSecret: process.env.CONSUMER_SECRET,
    consumerKey: process.env.CONSUMER_KEY,
    passkey: process.env.PASS_KEY,
    mpesaBaseUrl: "DEV"
})

await mobilePay.express({
            phone: "712765337",
            amount: "20", //KES
            tillOrPayBillNumber: "174379", // 
            account_reference: "Volant Digital LTD", 
            transaction_desc: "Buying Apples"
        }).then((result)=>{
            console.log(result)
        }).catch((error)=>{
            console.error(error)
        });

// mobilePay.paybill({
//             phone: "712765337",
//             amount: "100", //KES
//             payBillNumber: "3216396",//Paybill Number
//             account_reference: "Volant Digital", 
//             transaction_desc: "Buying Apples"
//         }).then((result)=>{
//             console.log(result)
//         }).catch((error)=>{
//             console.error(error)
//         });