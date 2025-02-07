// const mpesa = require("daraja-package");
import mpesa from "daraja-package";

const mobilePay = mpesa({
    callbackURL: "https://mydomain.com/b2b/result/",
    customerSecret: "kI3K9U23Lgwys7vyjGCGuCAvFoqzwXZuWKVjfCGpeDmPlhh5TgFJXMUGAussXKRe",
    consumerKey: "Es9jiYGr7QQAgh4V4MPwo0j00sIOxtXN5uGA0JGu002uhzDR"
})

await mobilePay.buyGoods({
            phone: "+254712765337",
            amount: "100", //KES
            tillNumber: "3216396", // Till number
            account_reference: "Volant Digital", 
            transaction_desc: "Buying Apples"
        }).then((result)=>{
            console.log(result)
        }).catch((error)=>{
            console.error(error)
        });

// mobilePay.paybill({
//             phone: "+254712765337",
//             amount: "100", //KES
//             payBillNumber: "3216396",//Paybill Number
//             account_reference: "Volant Digital", 
//             transaction_desc: "Buying Apples"
//         }).then((result)=>{
//             console.log(result)
//         }).catch((error)=>{
//             console.error(error)
//         });