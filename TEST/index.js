// const mpesa = require("daraja-package");
import mpesa from "daraja-package";

const mobilePay = mpesa({
    callbackURL: "http://localhost:5147/login/",
    secret: "e4lSZQUMhCXfkC78",
    consumer_key: "m250cZEoRrh3xAdlpvYqaTNOF6YwYhyA",
    mpesa_base_url: ""
})

mobilePay.buyGoods({
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