

import {timestamp as Timestamp} from "./timestamp"
import axios from "axios"

export default class Mpesa{

    constructor({ callbackURL, secret, consumer_key, mpesa_base_url="https://sandbox.safaricom.co.ke"}){

        if(!callbackURL || !secret || !consumer_key){
            throw new Error("All fields are required.");
        }

        this.callbackURL = callbackURL;
        this.secret=secret;
        this.consumer_key = consumer_key
        this.url = mpesa_base_url
    }

    async generateToken(){
        const secret = this.secret;
        const consumerKey = this.consumer_key;
    
        const auth = new Buffer.from(`${consumerKey}:${secret}`).toString("base64");
    
        await axios.get(`${this.url}/oauth/v1/generate?grant_type=client_credentials`, {
            headers: {
                "Authorization": `Basic ${auth}`
            },
        }).then((response) => {
            token = response.data.access_token;
            return token;
        }).catch((err) => {
            console.error("MPESA package ERROR: ", err);
            throw new Error(err)
        })
    }

    async paybill({phone, amount, payBillNumber, account_reference, transaction_desc}){
        return new Promise(async (resolve, reject)=>{
            try{
                const token = this.generateToken();
                const phoneNumber = phone; //Starts with 254 eg. 254708374149
                const amountFromUser = amount;
                const businessNumber = payBillNumber; //your paybill
                const mpesaPassword = this.mpesaPassword;
                const merchantEndPoint = `${this.url}/mpesa/stkpush/v1/processrequest`; // change the sandbox to api during production
                const callBackURL = this.callbackURL;
            
                const timestamp = Timestamp;
    
                const pass = (businessNumber + mpesaPassword + timestamp);
    
                const passwordSaf = btoa(pass);
            
                const darajaRequestBody = {
                    "BusinessShortCode": parseInt(businessNumber),
                    "Password": passwordSaf,
                    "Timestamp": timestamp,
                    "TransactionType": "CustomerPayBillOnline", 
                    "Amount": parseInt(amountFromUser),
                    "PartyA": parseInt(`254${phoneNumber}`),
                    "PartyB": parseInt(businessNumber),
                    "PhoneNumber": parseInt(`254${phoneNumber}`),
                    "CallBackURL": callBackURL,
                    "AccountReference": account_reference, //`254${phoneNumber}`
                    "TransactionDesc": transaction_desc //Enter your randomly generated ticket numbers here.
                };
            
             axios.post(merchantEndPoint, darajaRequestBody,
                {
                 headers:{
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }})
                .then((res)=>{
                    console.log(res.raw_body);
                    resolve(res.raw_body)
                }).catch((error)=>{
                    console.log(error);
                    reject({message: "Transaction Failed", code: `MPESA ERROR: ${error.code}`, error: error})
                })
                
            }catch(error){
                console.error({message: error.message, code: error.code});
                reject({message: error.message, code: error.code})
            }
        })
    }

    async buyGoods({phone, amount, tillNumber, account_reference, transaction_desc}){
        try{
            return new Promise(async (resolve, reject)=>{
                const token = await this.generateToken()
                const phoneNumber = phone; //Starts with 254 eg. 254708374149
                const amountFromUser = amount;
                const businessNumber = tillNumber; //your paybill
                const mpesaPassword = this.mpesaPassword;
                const merchantEndPoint = `${this.url}/mpesa/stkpush/v1/processrequest`; // change the sandbox to api during production
                const callBackURL = this.callbackURL;
            
                const timestamp = Timestamp;
    
                const pass = (businessNumber + mpesaPassword + timestamp);
    
                const passwordSaf = btoa(pass);
            
                const darajaRequestBody = {
                    "BusinessShortCode": parseInt(businessNumber),
                    "Password": passwordSaf,
                    "Timestamp": timestamp,
                    "TransactionType": "CustomerBuyGoodsOnline", //Switch to Customer Buy Goods
                    "Amount": parseInt(amountFromUser),
                    "PartyA": parseInt(`254${phoneNumber}`),
                    "PartyB": parseInt(businessNumber),
                    "PhoneNumber": parseInt(`254${phoneNumber}`),
                    "CallBackURL": callBackURL,
                    "AccountReference": account_reference, //`254${phoneNumber}`
                    "TransactionDesc": transaction_desc //Enter your randomly generated ticket numbers here.
                }
            
                return axios.post(merchantEndPoint, darajaRequestBody,
                    {
                     headers:{
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }})
                    .then((res)=>{
                        console.log(res.raw_body);
                        resolve(res)
                    }).catch((error)=>{
                        console.log(error);
                        reject(error)
                    });
            })
        }catch(error){
            console.error({message: error.message, code: error.code});
        }
    }
}