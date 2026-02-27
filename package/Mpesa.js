import { Request } from "node-fetch";

export default class Mpesa{

    constructor({ callbackURL, consumerSecret, consumerKey, passKey, mpesaBaseUrl}){
        this.callbackURL = callbackURL;
        this.secret = consumerSecret;
        this.consumer_key = consumerKey;
        this.mpesaPassword = passKey
        this.urls = {
            auth_token: "/oauth/v1/generate",
            // Reversal
            reversal: "/mpesa/reversal/v1/request",
            // C2B 
            c2b_v2: "/mpesa/c2b/v2/registerurl",
            c2b_transaction_status: "/mpesa/transactionstatus/v1/query",
            // C2B PayBill
            c2b_paybill_v1: "/mpesa/c2b/v1/registerurl",
            c2b_paybill_transaction_status: "/mpesa/transactionstatus/v1/query",
            // Transaction status
            transaction_status: "/mpesa/transactionstatus/v1/query",
            // Account Balance
            account_balance: "/mpesa/accountbalance/v1/query",
            // B2C
            b2c: "/mpesa/b2c/v1/paymentrequest",
            b2c_transaction_status: "/mpesa/transactionstatus/v1/query",
            b2c_account_balance: "/mpesa/accountbalance/v1/query",
            // M-PESA Express (Lipa na M-Pesa Production)
            express_stk_push: "/mpesa/stkpush/v1/processrequest",
            express_stk_push_query: "/mpesa/stkpushquery/v1/query",
            // B2B
            b2b_buygoods: "/mpesa/b2b/v1/paymentrequest", 
            b2b_paybill: "/mpesa/b2b/v1/paymentrequest",
            b2c_account_topup: "/mpesa/b2b/v1/paymentrequest",
            // Dynamic QR
            dynamicQR_code: "/mpesa/qrcode/v1/generate",
            // Bill Manager Generic API
            bill_manager_invoice_optin: "/v1/billmanager-invoice/v1/billmanager-invoice/optin",
            bill_manager_single_invoicing: "/v1/billmanager-invoice/v1/billmanager-invoice/single-invoicing",
            bill_manager_bulk_invoicing: "/v1/billmanager-invoice/v1/billmanager-invoice/bulk-invoicing",
            bill_manager_reconciliation: "/v1/billmanager-invoice/v1/billmanager-invoice/reconciliation",
            bill_manager_cancel_single_invoicing: "/v1/billmanager-invoice/v1/billmanager-invoice/cancel-single-invoice",
            bill_manager_cancel_bulk_invoicing: "/v1/billmanager-invoice/v1/billmanager-invoice/cancel-bulk-invoice",
            bill_manager_update_onboarding_details: "/v1/billmanager-invoice/v1/billmanager-invoice/change-optin-details",
            bill_manager_update_single_invoicing: "/v1/billmanager-invoice/v1/billmanager-invoice/change-invoice",
            bill_manager_update_bulk_invoicing: "/v1/billmanager-invoice/v1/billmanager-invoice/change-invoices"
        }

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
            const secretGen = this.secret;// consumer Secret
            const consumerKeyGen = this.consumer_key;// Consumer Key
            const token_url = `${this.url}${this.urls.auth_token}?grant_type=client_credentials`;
        
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

    /**
        *
        * LIPA NA M-PESA ONLINE API also known as M-PESA express is a Merchant/Business initiated C2B (Customer to Business) transaction.
        *
    **/
    async express({phone, amount, tillOrPayBillNumber, account_reference, transaction_desc}){
        try{

            if(typeof account_reference != 'string' && account_reference.length > 13){
                throw new Error("Account reference should not exceed 13 characters");
            }

            return new Promise(async (resolve, reject)=>{
                const token = await this.generateToken()
                const merchantEndPoint = `${this.url}${this.urls.express_stk_push}`;
                const phoneNumber = phone; //Starts with 254 eg. 254708374149
                const amountFromUser = amount;
                const businessNumber = tillOrPayBillNumber; //your paybill            
                const callBackURL = this.callbackURL;
                const timestamp = Timestamp()
                const passwordSaf = this.encrypted_passkey(businessNumber, timestamp);
            
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
                    "AccountReference": account_reference,//`254${phoneNumber}`
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

    /**
        *
        * Use this method to check the status of a Lipa Na M-Pesa Online Payment.
        *
    **/
    async expressPushQuery({ tillOrPayBillNumber, CheckoutRequestID }){
        try{
            return new Promise(async (resolve, reject)=>{

                if(typeof CheckoutRequestID != 'string')
                    throw new Error("Invalid CheckoutRequestID type")

                const token = await this.generateToken();
                const merchantEndpoint = `${this.url}${this.urls.express_stk_push_query}`
                const businessNumber = parseInt(`${tillOrPayBillNumber}`);
                const timestamp = Timestamp();
                const passwordSaf = this.encrypted_passkey(businessNumber, timestamp);

                const darajaRequestBody  = {
                      "BusinessShortCode": businessNumber,    
                      "Password": passwordSaf,    
                       "Timestamp": timestamp,    
                       "CheckoutRequestID": CheckoutRequestID,   
                }

                const requestHeaders =  new Headers();
                requestHeaders.append("Content-Type", "application.json");
                requestHeaders.append("Authorization", `Bearer ${token}`);

                const requestOptions = {
                    method: "POST", 
                    headers: requestHeaders,
                    body: JSON.stringify(darajaRequestBody)
                }

                const request = new Request(merchantEndpoint, requestOptions);
                const response = await fetch(request);
                if(response.error){
                    console.log("Express PUSH Query Error");
                    reject(response.error);
                    return;
                }

                const data = await response.json();
                console.log("Express PUSH Query Success");
                resolve(data);
                return;
                
            });
        }catch(error){
            console.error({
                message: error.message,
                code: error.code
            })
        }
    }


    /**
        * 
        * reversals method enables the reversal of Customer-to-Business (C2B) transactions.
        *
    **/
    async reversal({
        mpesa_business_username,
        shortCode,
        amount,
        remarks,
        timeoutURL, 
        resultURL,
        transactionID

    }){
        try{
            if(!mpesa_business_username || typeof mpesa_business_username != 'string' || !`^[a-zA-Z0-9]{5,20}$`.test(mpesa_business_username))
                throw new Error('Invalid mpesa business username');

            if(typeof remarks != 'string')
                throw new Error("Invalid remarks type");

            if(remarks.length > 100)
                throw new Error("Remarks is too long.");

            if(typeof timeoutURL != 'string' || !`/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\\\w \.-]*)*\/?`.test(timeoutURL))
                throw new Error("Invalid Time Out URL");

            if(typeof resultURL != 'string' || `/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\\\w \.-]*)*\/?`.test(resultURL))
                throw new Error("Invalid result URL");

            if(!transactionID)
                throw new Error("Transaction ID is required.");

            if(typeof transactionID != 'string')
                throw new Error("Invalid transaction ID type");

            if(isNaN(parseInt(`${amount}`)))
                throw new Error("Invalid amount");

            return new Promise(async (resolve, reject)=>{
                const token = await this.generateToken();
                const merchantEndpoint = `${this.url}${this.urls.reversal}`;
                const businessNumber = parseInt(`${shortCode}`);
                const amount_value = parseInt(amount);
                const passwordSaf = this.encrypted_passkey(businessNumber);

                if(amount_value <= 0)
                    throw new Error("Invalid amount");

                const darajaRequestBody = {
                    "Initiator": `${mpesa_business_username}`,
                    "SecurityCredential": passwordSaf,
                    "CommandID": "TransactionReversal",
                    "TransactionID": transactionID,
                    "Amount": `${amount_value}`,
                    "ReceiverParty": businessNumber,
                    "RecieverIdentifierType": "11",
                    "ResultURL": resultURL,//"https://mydomain.com/reversal/result",
                    "QueueTimeOutURL": timeoutURL,//"https://mydomain.com/reversal/queue"
                    "Remarks": remarks
                }

                const requestHeaders = new Headers();
                requestHeaders.append("Content-Type", "application/json");
                requestHeaders.append("Authorization", `Bearer ${token}`);

                const requestOptions = {
                    method: "POST",
                    headers: requestHeaders,
                    body: JSON.stringify(darajaRequestBody)
                }

                const request = new Request(merchantEndpoint, requestOptions);
                const response = await fetch(request);
                if(response.error){
                    console.error("M-Pesa Reversal Error:", response.error);
                    reject(response.error);
                    return;
                }

                const data = await response.json()
                // Any response code other than 0 is an error
                console.log("Successfully sent reversal request:", data);
                resolve(data)
                return;

            });
        }catch(error){
            console.error({
                message: error.message,
                code: error.code
            })
        }
    }

    /**
        * Customer to Business Automate delivery of M-PESA payment 
        * notifications to applications, websites, and ERP systems for 
        * real-time updates.
        *
        * Customer to Business (C2B) API, also known as the Register URL API, 
        * enables merchants to receive notifications for successful payments 
        * to their Paybill or Till numbers. Funds originate from the customer 
        * wallet and are transferred to the merchant’s short code.
        *
        * Payments can be initiated via SIM Toolkit, Mpesa App, Safaricom App, 
        * USSD, NI Push API, or Dynamic QR Code API.
        *
        * Use publicly available IP addresses or domain names.
        * Production URLs must be HTTPS; Sandbox allows HTTP.
        * Avoid keywords like M-PESA, Safaricom, exe, exec, cmd, SQL, query, 
        * etc., in URLs.
        * Do not use public URL testers (e.g., ngrok, mockbin, requestbin) in 
        * production.
        *
        * Note: On the sandbox, you are free to register your URLs multiple 
        * times or even overwrite the existing ones. In the production 
        * environment, this is a one-time API call that registers your 
        * validation and confirmation URLs to have them changed you can 
        * delete them on the URL management tab under self-service and 
        * re-register using register URL API, you can also email us at 
        * apisupport@safaricom.co.ke for assistance.
        *
        * Note: As you set up the default value, the words 
        * "Cancelled/Completed" must be in sentence case and well-spelled.
        *
    * */
    async customerToBusiness({
        ShortCode,
        ConfirmationURL,
        ValidationURL,
        ResponseType="Completed",
    }){
        try{
            if(ResponseType != "Completed" || ResponseType != "Cancelled")
            {
                throw new Error("Response type can either be 'Completed' or 'Cancelled' ");
            }

            return new Promise(async (resolve, reject)=>{
                const token = await this.generateToken();
                const merchantEndpoint = `${this.url}${this.urls.c2b_v2}`

                const darajarequestBody = {
                    "ShortCode": `${ShortCode}`,
                    "ResponseType": ResponseType,
                    "ConfirmationURL": ConfirmationURL,
                    "ValidationURL": ValidationURL
                }

                const requestHeaders = new Headers();
                requestHeaders.append("Content-Type", "application/json");
                requestHeaders.append("Authorization", `Bearer ${token}`);

                const requestOptions = {
                    method: "POST",
                    headers: requestHeaders,
                    body: JSON.stringify(darajarequestBody)
                }

                const request = new Request(merchantEndpoint, requestOptions);
                const response = await fetch(request);
                if(response.error){
                    console.error("Customer to Business Register URL failure:", response.error);
                    reject(response.error);
                    return;
                }
                
                const data = await response.json();
                console.log("Successfully Registered URL");
                resolve(data);
                return;

            });        
        }catch(error){
            console.error({
                message: error.message,
                code: error.code
            })
        }
    }

    async customerToBusinessPaybillv1({
    }){
        try{
            return new Promise(async (resolve, reject)=>{
                const token = await this.generateToken();
                const merchantEndpoint = `${this.url}${this.urls.c2b_paybill_v1}`
            });
        }catch(error){
            console.error({
                messsage: error.message,
                code: error.code
            })
        }
    }

    async transactionStatus(){
        try{
            return new Promise(async (resolve, reject)=>{
                const token = await this.generateToken();
                const merchantEndpoint = `${this.url}${this.urls.transaction_status}`
            });
        }catch(error){
            console.error({
                message: error.message,
                code: error.code
            })
        }
    }

    async accountBalance(){
        try{
            return new Promise(async (resolve, reject)=>{
                const token = await this.generateToken();
                const merchantEndpoint = `${this.url}${this.urls.account_balance}`
            });
        }catch(error){
            console.error({
                message: error.message,
                code: error.code
            })
        }
    }

    async businessToCustomer(){
        try{
            return new Promise(async (resolve, reject)=>{
                const token = await this.generateToken();
                const merchantEndpoint = `${this.url}${this.urls.b2c}`
            });
        }catch(error){
            console.error({
                message: error.message,
                code: error.code
            })
        }
    }

    async businessToCustomerTransactionStatus(){
        try{
            return new Promise(async (resolve, reject)=>{
                const token = await this.generateToken();
                const merchantEndpoint = `${this.url}${this.urls.b2c_transaction_status}`
            });
        }catch(error){
            console.error({
                message: error.message,
                code: error.code
            })
        }
    }

    async businessToCustomerAccountBalance(){
        try{
            return new Promise(async (resolve, reject)=>{
                const token = await this.generateToken();
                const merchantEndpoint = `${this.url}${this.urls.b2c_account_balance}`
            });
        }catch(error){
            console.error({
                message: error.message,
                code: error.code
            })
        }
    }

    async businessToBusinessBuyGoods(){
        try{
            return new Promise(async (resolve, reject)=>{
                const token = await this.generateToken();
                const merchantEndpoint = `${this.url}${this.urls.b2b_buygoods}`
            });
        }catch(error){
            console.error({
                message: error.message,
                code: error.code
            })
        }
    }

    async businessToBusinessPaybill(){
        try{
            return new Promise(async (resolve, reject)=>{
                const token = await this.generateToken();
                const merchantEndpoint = `${this.url}${this.urls.b2b_paybill}`
            });
        }catch(error){
            console.error({
                message: error.message,
                code: error.code
            })
        }
    }

    async businessToCustomerAccountTopup(){
        try{
            return new Promise(async (resolve, reject)=>{
                const token = await this.generateToken();
                const merchantEndpoint = `${this.url}${this.urls.b2c_account_topup}`
            });
        }catch(error){
            console.error({
                message: error.message,
                code: error.code
            })
        }
    }

    async dynamicQRCode(){
        try{
            return new Promise(async (resolve, reject)=>{
                const token = await this.generateToken();
                const merchantEndpoint = `${this.url}${this.urls.dynamicQR_code}`
            });
        }catch(error){
            console.error({
                message: error.message,
                code: error.code
            })
        }
    }

    async billManagerInvoiceOptin(){
        try{
            return new Promise(async (resolve, reject)=>{
                const token = await this.generateToken();
                const merchantEndpoint = `${this.url}${this.urls.bill_manager_invoice_optin}`
            });
        }catch(error){
            console.error({
                message: error.message,
                code: error.code
            })
        }
    }

    async billManagerSingleInvoicing(){
        try{
            return new Promise(async (resolve, reject)=>{
                const token = await this.generateToken();
                const merchantEndpoint = `${this.url}${this.urls.bill_manager_single_invoicing}`
            });
        }catch(error){
            console.error({
                message: error.message,
                code: error.code
            })
        }
    }

    async billManagerBulkInvoicing(){
        try{
            return new Promise(async (resolve, reject)=>{
                const token = await this.generateToken();
                const merchantEndpoint = `${this.url}${this.urls.bill_manager_bulk_invoicing}`
            });
        }catch(error){
            console.error({
                message: error.message,
                code: error.code
            })
        }
    }

    async billManagerReconciliation(){
        try{
            return new Promise(async (resolve, reject)=>{
                const token = await this.generateToken();
                const merchantEndpoint = `${this.url}${this.urls.bill_manager_reconciliation}`
            });
        }catch(error){
            console.error({
                message: error.message,
                code: error.code
            })
        }
    }

    async billManagerCancelSingleInvoicing(){
        try{
            return new Promise(async (resolve, reject)=>{
                const token = await this.generateToken();
                const merchantEndpoint = `${this.url}${this.urls.bill_manager_cancel_single_invoicing}`;
            });
        }catch(error){
            console.error({
                message: error.message,
                code: error.code
            })
        }
    }

    async billManagerCancelBulkInvoicing(){
        try{
            return new Promise(async (resolve, reject)=>{
                const token = await this.generateToken();
                const merchantEndpoint = `${this.url}${this.urls.bill_manager_cancel_bulk_invoicing}`
            });
        }catch(error){
            console.error({
                message: error.message,
                code: error.code
            })
        }
    }

    async billManagerUpdateOnBoardingdetails(){
        try{
            return new Promise(async (resolve, reject)=>{
                const token = await this.generateToken();
                const merchantEndpoint = `${this.url}${this.urls.bill_manager_update_onboarding_details}`
            });
        }catch(error){
            console.error({
                message: error.message,
                code: error.code
            })
        }
    }

    async billManagerUpdateSingleInvoicing(){
        try{
            return new Promise(async (resolve, reject)=>{
                const token = await this.generateToken();
                const merchantEndpoint = `${this.url}${this.urls.bill_manager_single_invoicing}`
            });
        }catch(error){
            console.error({
                message: error.message,
                code: error.code
            })
        }
    }

    async billManagerUpdateBulkInvoicing(){
        try{
            return new Promise(async (resolve, reject)=>{
                const token = await this.generateToken();
                const merchantEndpoint = `${this.url}${this.urls.bill_manager_bulk_invoicing}`
            });
        }catch(error){
            console.error({
                message: error.message,
                code: error.code
            })
        }
    }

    encrypted_passkey(businessNumber, timeStamp){
        const mpesaPassword = this.mpesaPassword;
        const timestamp  = timeStamp || Timestamp();
        const pass = (businessNumber + mpesaPassword + timestamp)
        const passwordSaf = btoa(pass);
        return passwordSaf;
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
