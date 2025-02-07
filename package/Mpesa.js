export default class Mpesa{

    constructor({ callbackURL, secret, consumer_key, mpesa_base_url="https://sandbox.safaricom.co.ke"}){

        if(!secret || !consumer_key){
            throw new Error("Secreat and consumer key are required.");
        }

        if(!mpesa_base_url || mpesa_base_url === ""){
            mpesa_base_url = "https://sandbox.safaricom.co.ke";
        }

        this.callbackURL = callbackURL;
        this.secret=secret;
        this.consumer_key = consumer_key
        this.url = mpesa_base_url
    }

    async generateToken(){
        try{
            const secretGen = this.secret;
            const consumerKeyGen = this.consumer_key;
            const token_url = `${this.url}/oauth/v1/generate?grant_type=client_credentials`;
        
            console.log(token_url)
            const auth = new Buffer.from(`${consumerKeyGen}:${secretGen}`).toString("base64");

            
            const response = await fetch(token_url, {
                headers: {
                    "Authorization": `Basic ${auth}`
                },
            })
            .then((response)=>{
                            console.log(response)
                            console.log("Body", response.body)
                            const token = response.data.access_token
                            if(!token){
                                console.log("Token was not generated")
                                return;
                            }
                            return token;
                        }).catch((error)=>{
                            console.error("MPESA Token generation error");
                            throw new Error(error);
                        });
            return response;
        }catch(error){
            console.error("MPESA generate token function error:", error)
            throw new Error(error)
        }
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
            
                const timestamp = Timestamp();
    
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

                if(!token){
                    console.log("Token was not generated")
                    return;
                }

                const requestHeaders = new Headers()
                requestHeaders.append('Content-Type', 'application/json')
                requestHeaders.append('Authorization', `Bearer ${token}`)

                const requestOptions = {
                    method: "POST",
                    headers: requestHeaders,
                    body: darajaRequestBody
                }

                const request = new Request(merchantEndPoint, requestOptions)

                await fetch(request)
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
                throw new Error(error)
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
            
                const timestamp = Timestamp();
    
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

                const requestHeaders = new Headers()
                requestHeaders.append("Content-Type", "application/json")
                requestHeaders.append("Authorization", `Bearer ${token}`)

                const requestOptions = {
                    method: "POST",
                    headers: requestHeaders,
                    body: darajaRequestBody
                }

                const request = new Request(merchantEndPoint, requestOptions)
                await fetch(request)
                        .then((res)=>{
                            console.log(res.raw_body);
                            resolve(res)
                        }).catch((error)=>{
                            console.log(error);
                            reject(error)
                            throw new Error(error)
                        });
            })
        }catch(error){
            console.error({message: error.message, code: error.code});
        }
    }
}

function Timestamp(){
    const date = new Date();
    
    const timestamp = (
        date.getFullYear() +
        ("0" + (date.getMonth() + 1)).slice(-2) +
        ("0" + date.getDate()).slice(-2) +
        ("0" + date.getHours()).slice(-2) +
        ("0" + date.getMinutes()).slice(-2) +
        ("0" + date.getSeconds()).slice(-2)
    );

    return timestamp;
}