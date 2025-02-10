export default class Mpesa{

    constructor({ callbackURL, consumerSecret, consumerKey, passKey, mpesaBaseUrl}){
        this.callbackURL = callbackURL;
        this.secret = consumerSecret;
        this.consumer_key = consumerKey;
        this.mpesaPassword = passKey

        switch(mpesaBaseUrl){
            case "DEV":
                this.url = "https://sandbox.safaricom.co.ke";
            case "PRODUCTION":
                this.url = "https://api.safaricom.co.ke";
            default:
                this.url = "https://sandbox.safaricom.co.ke";
        }

        if(!this.mpesaPassword)
            throw new Error("Passkey is required")

        if(!this.secret)
            throw new Error("Consumer Secret is required.");
        
        if(!this.consumer_key)
            throw new Error("Consumer key is required.");

        if(!this.callbackURL)
            throw new Error("Callback URL is required");
        
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
                    "Authorization": `Basic ${auth}`,
                    "Content-Type":"application/json"
                },
            })

            // Check if the response is successful
            if (!response.ok) {
                throw new Error(`Failed to generate token. Status: ${response.status}`);
            }
      

            // Parse the response as JSON
            const data = await response.json();
            console.log("Response Data:", data);

            // Extract and return the access token
            const token = await data.access_token;
            if (!token) {
                throw new Error("Access token not found in response");
            }

            console.log("Generated Token:", token);
            return token;
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

                const response = await fetch(request)
                if(response.error)
                {
                    console.log("Paybill error:", response.error)
                    reject(response.error)
                    return;
                }

                const data = await response.json() 
                
                console.log("BuyGoods success:", data)
                resolve(data)
                return;
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
                // const merchantEndPoint = `${this.url}/mpesa/stkpush/v1/processrequest`; // change the sandbox to api during production
                const merchantEndPoint = `${this.url}/mpesa/c2b/v1/simulate`; // change the sandbox to api during production
                const callBackURL = this.callbackURL;
            
                const timestamp = Timestamp();
    
                const pass = (businessNumber + mpesaPassword + timestamp);
    
                const passwordSaf = btoa(pass);
        

                const darajaRequestBody = {
                    "ShortCode": parseInt(tillNumber),
                    "CommandID": "CustomerBuyGoodsOnline",
                    "Amount": `${amountFromUser}`,
                    "Msisdn": `254${phoneNumber}`,
                    "BillRefNumber": `NULL`,
                }
                
                const requestHeaders = new Headers()
                requestHeaders.append("Content-Type", "application/json")
                requestHeaders.append("Authorization", `Bearer ${token}`)

                const requestOptions = {
                    method: "POST",
                    headers: requestHeaders,
                    body: JSON.stringify(darajaRequestBody)
                }

                const request = new Request(merchantEndPoint, requestOptions)
                const response = await fetch(request)
                if(response.error)
                {
                    console.log("Buygoods error:", response.error)
                    reject(response.error)
                    return;
                }

                const data = await response.json() 
                
                console.log("BuyGoods success:", data)
                resolve(data)
                return;
            })
        }catch(error){
            console.error({message: error.message, code: error.code});
        }
    }

    async express({phone, amount, tillOrPayBillNumber, account_reference, transaction_desc}){
        try{
            return new Promise(async (resolve, reject)=>{
                const token = await this.generateToken()
                const phoneNumber = phone; //Starts with 254 eg. 254708374149
                const amountFromUser = amount;
                const businessNumber = tillOrPayBillNumber; //your paybill
                const mpesaPassword = this.mpesaPassword;
                // const merchantEndPoint = `${this.url}/mpesa/stkpush/v1/processrequest`; // change the sandbox to api during production
                const merchantEndPoint = `${this.url}/mpesa/stkpush/v1/processrequest`; // change the sandbox to api during production
                const callBackURL = this.callbackURL;
            
                const timestamp = Timestamp();
    
                const pass = (businessNumber + mpesaPassword + timestamp);
    
                const passwordSaf = btoa(pass);
            
                console.log("businessNumber:", businessNumber)
                console.log("passKey:", mpesaPassword)
                console.log("Timestamp:", timestamp)
                console.log("Password:", passwordSaf)
                console.log("Password", passwordSaf)
                
                const darajaRequestBody = {
                    "BusinessShortCode": parseInt(businessNumber),
                    "Password": passwordSaf,
                    "Timestamp": timestamp,
                    "TransactionType": "CustomerPayBillOnline", //Switch to Customer Buy Goods
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
                    body: JSON.stringify(darajaRequestBody)
                }

                const request = new Request(merchantEndPoint, requestOptions)
                const response = await fetch(request)
                if(response.error)
                {
                    console.log("Buygoods error:", response.error)
                    reject(response.error)
                    return;
                }

                const data = await response.json() 
                
                console.log("BuyGoods success:", data)
                resolve(data)
                return;
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