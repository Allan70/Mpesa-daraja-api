import mpesa from "./package";

const mobilePay = mpesa({
    callbackURL: "",
    secret: "",
    consumer_key: "",
    mpesa_base_url: ""
})

mobilePay.buyGoods({
            phone: "+254712765337",
            amount: "100", //KES
            tillNumber: "3216396", // Till number
            account_reference: "Volant Digital", 
            transaction_desc: "Buying API keys"
        }).then((result)=>{
            console.log(result)
        }).catch((error)=>{
            console.error(error)
        })

mobilePay.paybill({
            phone: "+254712765337",
            amount: "100", //KES
            payBillNumber: "3216396",//Paybill Number
            account_reference: "Volant Digital", 
            transaction_desc: "Buying API keys"
        }).then((result)=>{
            console.log(result)
        }).catch((error)=>{
            console.error(error)
        })