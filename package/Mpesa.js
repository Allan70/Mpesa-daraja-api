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
        * LIPA NA M-PESA ONLINE API also known as M-PESA express is a 
        * Merchant/Business initiated C2B (Customer to Business) transaction.
        *
        * @typedef {Object} data
        * @property {string} MerchantRequestID
        * @property {string} CheckoutRequestID
        * @property {string} ResponseCode
        * @property {string} ResponseDescription
        * @property {string} CustomerMessage
        *
        * @param {Object} param0 
        * @param {string} param0.phone 
        * @param {string} param0.amount 
        * @param {string} param0.tillOrPayBillNumber 
        * @param {string} param0.account_reference 
        * @param {string} param0.transaction_desc 
        *
        * @returns {data}
        *
    **/
    async express({
        phone, 
        amount, 
        tillOrPayBillNumber, 
        account_reference, 
        transaction_desc
    }){
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
                    "Amount": parseFloat(amountFromUser),
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
                    console.error("Buygoods error:", response.error)
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
        * @typeef {Object} data
        * @property {string} ResponseCode
        * @property {string} ResponseDescription
        * @property {string} MerchantRequestID
        * @property {string} CheckoutRequestID
        * @property {string} ResultCode
        * @property {string} ResultDesc
        *
        * @param {Object} param0 
        * @param {string} param0.tillOrPayBillNumber 
        * @param {string} param0.CheckoutRequestID 
        *
        * @returns {data}
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
        * Reversals API enables the reversal of Customer-to-Business (C2B) transactions.
        *
        * @typedef {Object} data
        * @property {string} OriginatorConversationID
        * @property {string} ConversationID
        * @property {string} ResponseCode
        * @property {string} ResponseDescription
        * 
        * @param {Object} param0 
        * @param {string} param0.mpesa_business_username 
        * @param {string} param0.api_shortcode 
        * @param {string} param0.amount 
        * @param {string} param0.remarks 
        * @param {string} param0.timeoutURL 
        * @param {string} param0.resultURL 
        * @param {string} param0.transactionID 
        *
        * @returns {data}
        *
    **/
    async reversal({
        api_username,
        api_shortcode,
        amount,
        remarks,
        timeoutURL, 
        resultURL,
        transactionID

    }){
        try{
            if(!api_username || typeof api_username != 'string' || !`^[a-zA-Z0-9]{5,20}$`.test(api_username))
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
                const businessNumber = parseInt(`${api_shortcode}`);
                const amount_value = parseInt(amount);
                const passwordSaf = this.encrypted_passkey(businessNumber);

                if(amount_value <= 0)
                    throw new Error("Invalid amount");

                const darajaRequestBody = {
                    "Initiator": `${api_username}`,
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
        * @typedef {Object} data
        * @property {string} OriginatorCoversationID
        * @property {string} ResponseCode
        * @property {string} ResponseDescription
        *
        * @param {Object} param0 
        * @param {string} param0.ShortCode 
        * @param {string} param0.ConfirmationURL 
        * @param {string} param0.ValidationURL 
        * @param {string} [param0.ResponseType="Completed"]
        *
        * @returns {data}
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


    /**
        *
        * Register validation and confirmation URLs on M-Pesa
        *
        * @typedef {Object} data
        * @property {string} OriginatorCoversationID
        * @property {string} ResponseCode
        * @property {string} ResponseDescription
        *
        * @param {Object} param0 
        * @param {string} param0.ShortCode 
        * @param {string} [param0.ResponseType="Completed"] "Completed" | "Cancelled" 
        * @param {string} param0.ConfirmationURL 
        * @param {string} param0.ValidationURL 
        *
        * @returns {data}
        *
    * */
    async customerToBusinessv1({
        ShortCode,
        ResponseType = "Completed",
        ConfirmationURL,
        ValidationURL
    }){
        try{
            if(ResponseType != "Completed" || ResponseType != "Cancelled"){
                throw new Error("response type can either be 'Completed' or 'Cancelled'");
            }

            return new Promise(async (resolve, reject)=>{
                const token = await this.generateToken();
                const merchantEndpoint = `${this.url}${this.urls.c2b_paybill_v1}`;

                const darajaRequestBody = {    
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
                    body: JSON.strigify(darajaRequestBody)
                }

                const request = Request(merchantEndpoint, requestOptions);
                const response = await fetch(request);
                if(response.error){
                    console.error("Customer to Business v1 Registrer URL failure")
                    reject(response.error)
                    return;
                }

                const data = await response.json();
                console.log("Successfully Registered v1 URL");
                resolve(data);
                return;

            });
        }catch(error){
            console.error({
                messsage: error.message,
                code: error.code
            })
        }
    }

    /**
        *
        * The Transaction status API can be used as a secondary reconciliation 
        * mechanism when Callbacks are not received. To check the status of a 
        * transaction, you are required to have either an M-Pesa Receipt number 
        * or an Originator Conversation ID of the transaction
        *
        * @typedef {Object} data
        * @property {string} OriginatorConversationID
        * @property {string} ConversationID
        * @property {string} ResponseCode
        * @property {string} ResponseDescription
        *
        * @param {Object} param0 
        * @param {string} param0.api_username 
        * @param {string} param0.transaction_id 
        * @param {string} param0.short_code 
        * @param {string} param0.MSISDN 
        * @param {string} param0.remarks 
        * @param {string} [param0.occasion="OK"] 
        * @param {string} param0.result_url 
        * @param {string} param0.queue_timeout_url 
        * @param {string} param0.OriginalConversationID 
        *
        * @returns {data}
        *
    * */
    async transactionStatus({
        api_username,
        transaction_id,
        short_code, //Required
        MSISDN, // Optional value
        remarks,
        occasion = "OK",
        result_url,
        queue_timeout_url,
        OriginalConversationID
    }){
        try{
            return new Promise(async (resolve, reject)=>{
                const token = await this.generateToken();
                const merchantEndpoint = `${this.url}${this.urls.transaction_status}`
                const passwordSaf = this.encrypted_passkey(short_code);
                const darajaRequestBody = {
                    "Initiator": `${api_username}`,
                    "SecurityCredential":`${passwordSaf}` ,
                    "CommandID": "TransactionStatusQuery",
                    "TransactionID": `${transaction_id}`,
                    "OriginalConversationID": `${OriginalConversationID}`,
                    "PartyA": `${short_code || MSISDN}`,
                    "IdentifierType": "4",
                    "ResultURL": `${result_url}`,
                    "QueueTimeOutURL": `${queue_timeout_url}`,
                    "Remarks": `${remarks}`,
                    "Occasion": `${occasion}`
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
                    console.error("Transaction Status failure");
                    reject(response.error);
                    return;
                }

                const data = await response.json()
                console.log("Successfully fetched Transaction Status");
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
        * The M-PESA Account Balance API by Safaricom enables organizations to 
        * programmatically check their M-PESA account balances. This is essential 
        * for automating financial processes, monitoring account status, and 
        * ensuring sufficient funds for operations.
        *
        * Key Features:
        *   - Real-time Balance Inquiry: Instantly retrieve your M-PESA account balance.
        *   - Secure Access: Authentication and authorization ensure only permitted 
        *   entities access the balance.
        *   - Automated Responses: Receive automatic acknowledgments and 
        *   responses to inquiries.
        *
        * @typedef {Object} data
        * @property {string} OriginatorConversationID
        * @property {string} ConversationID
        * @property {string} ResponseCode
        * @property {string} ResponseDescription
        *
        * @param {Object} param0 
        * @param {string} param0.api_username 
        * @param {string} param0.short_code 
        * @param {string} param0.queueTimeoutURL 
        * @param {string} param0.resultURL 
        * @param {string} param0.remarks
        *
        * @returns {data}
        *
        *
    * */
    async accountBalance({
        api_username,
        short_code,
        queueTimeoutURL,
        resultURL,
        remarks = "ok"
    }){
        try{
            return new Promise(async (resolve, reject)=>{
                const token = await this.generateToken();
                const merchantEndpoint = `${this.url}${this.urls.account_balance}`
                const passwordSaf = this.encrypted_passkey(short_code);

                const darajaRequestBody = {
                    "Initiator": `${api_username}`,
                    "SecurityCredential": `${passwordSaf}`,
                    "CommandID": "AccountBalance",
                    "PartyA": `${short_code}`,
                    "IdentifierType": "4",
                    "Remarks": `${remarks}`,
                    "QueueTimeOutURL":`${queueTimeoutURL}`,
                    "ResultURL": `${resultURL}`
                }

                const requestHeaders = new Headers();
                requestHeaders.append("Content-Type", "application/json")
                requestHeaders.append("Authorization", `Bearer ${token}`)

                const requestOptions = {
                    method: "POST",
                    headers: requestHeaders,
                    body: JSON.stringify(darajaRequestBody)
                }

                const request = new Request(merchantEndpoint, requestOptions);
                const response = await fetch(request);
                if(response.error){
                    console.error("Account Balance request failure:", response.error);
                    reject(response.error);
                    return;
                }

                const data = await response.json();
                console.log("Successfully Requested Account Balance")
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
        * B2C API is used to make payments from a Business to Customers'
        * number also known as Bulk Disbursements.
        *
        * @typedef {Object} data
        * @property {string} ConversationID
        * @property {string} OriginatorConversationID
        * @property {string} ResponseCode
        * @property {string} ResponseDescription
        *
        *
        * @param {Object} param0 
        * @param {string} param0.OriginatorConversationID 
        * @param {string} param0.api_username 
        * @param {string} param0.amount 
        * @param {string} param0.short_code 
        * @param {string} [param0.remarks="ok"] 
        * @param {string} param0.customer_phone_number 
        * @param {string} param0.queue_timeout_url 
        * @param {string} param0.result_url 
        * @param {string} [param0.occassion="payout"] 
        *
        * @returns {data}
        *
    * */
    async businessToCustomer({
        OriginatorConversationID,
        api_username,
        amount,
        short_code,
        remarks = "ok",
        customer_phone_number,//2547XXXXXXXX
        queue_timeout_url, 
        result_url,
        occassion = "payout"
    }){
        try{
            return new Promise(async (resolve, reject)=>{
                const token = await this.generateToken();
                const merchantEndpoint = `${this.url}${this.urls.b2c}`
                const passwordSaf = this.encrypted_passkey(short_code);

                const darajaRequestBody = { 
                    "OriginatorConversationID": `${OriginatorConversationID}`, 
                    "InitiatorName": `${api_username}`, 
                    "SecurityCredential": `${passwordSaf}`, 
                    "CommandID": "BusinessPayment", 
                    "Amount": `${amount}`, 
                    "PartyA": `${short_code}`, 
                    "PartyB": `${customer_phone_number}`, 
                    "Remarks": `${remarks}`, 
                    "QueueTimeOutURL": `${queue_timeout_url}`, 
                    "ResultURL": `${result_url}`, 
                    "Occassion": `${occassion}` 
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
                    console.error("Business to Customer transaction failure:", response.error);
                    reject(response.error);
                    return;
                }

                const data = await response.json();
                console.log("Successful Business to Customer transaction");
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
        *
        * This API enables you to pay for goods and services directly from your 
        * business account to a till number, merchant store number 
        * or Merchant HO.
        *
        * @typedef {Object} data
        * @property {string} OriginatorConversationID
        * @property {string} ConversationID
        * @property {string} ResponseCode
        * @property {string} ResponseDescription
        *
        * @param {Object} param0 
        * @param {string} param0.api_username 
        * @param {string} param0.api_short_code 
        * @param {string} param0.business_short_code 
        * @param {string} param0.amount 
        * @param {string} param0.account_reference (Account number)
        * @param {string} param0.requester_phone_number 
        * @param {string} [param0.remarks="OK"] 
        * @param {string} param0.timeoutURL 
        * @param {string} param0.resultURL
        *
        * @returns {data}
        *
    * */
    async businessToBusinessBuyGoods({
        api_username,
        api_short_code,
        business_short_code,
        amount,
        account_reference,
        requester_phone_number,
        remarks = "OK",
        timeoutURL,
        resultURL
    }){
        try{
            return new Promise(async (resolve, reject)=>{
                const token = await this.generateToken();
                const merchantEndpoint = `${this.url}${this.urls.b2b_buygoods}`
                const passwordSaf = this.encrypted_passkey(api_short_code);
                const darajaRequestBody = {    
                    "Initiator":`${api_username}`,
                    "SecurityCredential": `${passwordSaf}`,
                    "Command ID": "BusinessBuyGoods",
                    "SenderIdentifierType": "4",
                    "RecieverIdentifierType":"4",
                    "Amount":`${amount}`,
                    "PartyA":`${api_short_code}`,
                    "PartyB":`${business_short_code}`,
                    "AccountReference":`${account_reference}`,
                    "Requester":`${requester_phone_number}`,
                    "Remarks": remarks,
                    "QueueTimeOutURL":`${timeoutURL}`,
                    "ResultURL":`${resultURL}`,
                }

                const requestHeaders = new Headers()
                requestHeaders.append("Content-Type", "application/json");
                requestHeaders.append("Authorization", `bearer ${token}`);

                const requestOptions = {
                    method: "POST", 
                    headers: requestHeaders,
                    body: JSON.stringify(darajaRequestBody)
                }

                const request = new Request(merchantEndpoint, requestOptions);
                const response = await fetch(request);
                if(response.error){
                    console.log("Business to Business Buygoods error:", request.error);
                    reject(response.error)
                    return;
                }

                const data = await response.json()
                console.log("Business to Business BuyGoods.")
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
        * This API enables you to pay bills directly from your business 
        * account to a pay bill number, or a paybill store.
        *
        * @typedef {Object} data
        * @property {string} OriginatorConversationID
        * @property {string} ConversationID
        * @property {string} ResponseCode
        * @property {string} ResponseDescription
        *
        * @param {Object} param0 
        * @param {string} param0.api_username 
        * @param {string} param0.api_short_code 
        * @param {string} param0.amount 
        * @param {string} param0.recipient_short_code 
        * @param {string} param0.account_reference 
        * @param {string} param0.requester_phone_number 
        * @param {string} [param0.remarks="OK"] 
        * @param {string} param0.queue_timeout_url 
        * @param {string} param0.result_url 
        *
        *
        * @returns {data}
        *
    * */
    async businessToBusinessPaybill({
        api_username,
        api_short_code,
        amount,
        recipient_short_code, 
        account_reference,
        requester_phone_number,
        remarks = "OK",
        queue_timeout_url, 
        result_url
    }){
        try{
            return new Promise(async (resolve, reject)=>{
                const token = await this.generateToken();
                const merchantEndpoint = `${this.url}${this.urls.b2b_paybill}`
                const passwordSaf = this.encrypted_passkey(api_short_code)
                const darajaRequestBody = {    
                    "Initiator":`${api_username}`,
                    "SecurityCredential": `${passwordSaf}`,
                    "Command ID": "BusinessPayBill",
                    "SenderIdentifierType": "4",
                    "RecieverIdentifierType":"4",
                    "Amount":`${amount}`,
                    "PartyA": `${api_short_code}`,
                    "PartyB": `${recipient_short_code}`,
                    "AccountReference":`${account_reference}`,
                    "Requester":`${requester_phone_number}`,
                    "Remarks":`${remarks}`,
                    "QueueTimeOutURL":`${queue_timeout_url}`,
                    "ResultURL": `${result_url}`,
                }

                const requestHeaders = new Headers();
                requestHeaders.append("Content-Type","application/json");
                requestHeaders.append("Authorization", `Bearer ${token}`);

                const requestOptions = {
                    method: "POST",
                    headers: requestHeaders,
                    body: JSON.stringify(darajaRequestBody)
                }

                const request = new Request(merchantEndpoint, requestOptions);
                const response = await fetch(request);
                
                if(response.error){
                    console.log("Business to Business Paybill Transaction Error");
                    reject(response.error);
                    return;
                }

                const data = await response.json()
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

    /*
        *
        * This API enables you to pay bills directly from your business 
        * account to a pay bill number, or a paybill store.
        *
        * @typedef {Object} data
        * @property {string} OriginatorConversationID
        * @property {string} ConversationID
        * @property {string} ResponseCode
        * @property {string} ResponseDescription
        *
        * @param {Object} param0
        * @param {string} param0.api_username
        * @param {string} param0.api_short_code
        * @param {string} param0.amount
        * @param {string} param0.customer_short_code
        * @param {string} param0.account_number
        * @param {string} [param0.remarks = "OK"]
        * @param {string} param0.queue_timeout_url
        * @param {string} param0.result_url
        *
        * @returns {data}
        *
    * */ 
    async businessToCustomerAccountTopup({
        api_username,        
        api_short_code,
        amount,
        customer_short_code,
        customer_mobile_number,
        account_number,
        remarks = "OK",
        queue_timeout_url, 
        result_url
    }){
        try{
            return new Promise(async (resolve, reject)=>{
                const token = await this.generateToken();
                const merchantEndpoint = `${this.url}${this.urls.b2c_account_topup}`
                const passwordSaf  = this.encrypted_passkey(api_short_code);

                const darajaRequestBody = {    
                    "Initiator": `${api_username}`,
                    "SecurityCredential": `${passwordSaf}`,
                    "SenderIdentifierType":"4",
                    "RecieverIdentifierType":"4",
                    "Amount":`${amount}`,
                    "PartyA":`${api_short_code}`,
                    "PartyB":`${customer_short_code}`,
                    "AccountReference":`${account_number}`,
                    "Requester":`${customer_mobile_number}`,
                    "Remarks":`${remarks}`,
                    "QueueTimeOutURL":`${queue_timeout_url}`,
                    "ResultURL": `${result_url}`
                }

                const requestHeaders = new Headers()
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
                    console.error("Business to Customer Account TopUp Error: ", response.error);
                    reject(response.error);
                    return; 
                }

                const data= await response.json()
                console.log("Business to Customer Account Topup Successful"); 
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
        *
        * Use this API to generate a Dynamic QR which enables Safaricom M-PESA 
        * customers who have My Safaricom App or M-PESA app, to scan a QR 
        * (Quick Response) code, to capture till number and amount then 
        * authorize to pay for goods and services at select LIPA NA M-PESA 
        * (LNM) merchant outlets.
        *
        * 	Transaction Type. The supported types are:
        * 	BG: Pay Merchant (Buy Goods).
        * 	WA: Withdraw Cash at Agent Till.
        * 	PB: Paybill or Business number.
        * 	SM: Send Money(Mobile number)
        * 	SB: Sent to Business. Business number CPI in MSISDN format.
        *
        * 	Credit Party Identifier.Can be a Mobile Number, Business Number, 
        * 	Agent Till, Paybill or Business number, or Merchant Buy Goods.
        *
        * qr_code_size: Size of the QR code image in pixels. QR code image 
        * will always be a square image.
        *
        * @typedef {Object} data
        * @property {string} ResponseCode
        * @property {string} RequestID
        * @property {string} ResponseDescription
        * @property {string} QRCode
        *
        * @param {Object} param0 
        * @param {string} param0.your_business_name 
        * @param {string} param0.reference_value 
        * @param {string} param0.amount 
        * @param {string} param0.transaction_type
        * @param {string} param0.credit_party_identifier 
        * @param {number} [param0.qr_code_size=300] 
        *
        * @returns {data}
        *
    * */
    async dynamicQRCode({
        your_business_name,
        reference_value,
        amount,
        transaction_type,
        credit_party_identifier,
        qr_code_size = 300
    }){
        try{
            return new Promise(async (resolve, reject)=>{
                const token = await this.generateToken();
                const merchantEndpoint = `${this.url}${this.urls.dynamicQR_code}`

                if(transaction_type != "BG" || transaction_type !=  "WA" || transaction_type != "PB" || transaction_type != "SM" || transaction_type != SB){
                    reject("Invalid Transaction Type")
                    return;
                }

                const darajaRequestBody = {    
                    "MerchantName": `${your_business_name}`,
                    "RefNo": `${reference_value}`,
                    "Amount": parseFloat(`${amount}`),
                    "TrxCode": `${transaction_type}`,
                    "CPI": `${credit_party_identifier}`,
                    "Size": qr_code_size
                }

                const requestHeaders = new Headers();
                requestHeaders.append("Content-Type","application/json")
                requestHeaders.append("Authorization", `Bearer ${token}`)

                const requestOptions = {
                    method : "POST",
                    headers: requestHeaders, 
                    body: JSON.stringify(darajaRequestBody)
                }

                const request = new Request(merchantEndpoint, requestOptions)
                const response = await fetch(request)
                if(response.error){
                    console.error("Dynamic QR code Error:", response.error)
                    reject(response.error)
                    return;
                }

                const data = await response.json();
                console.log("Successfully created Dynamic QR code")
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
        *
        * M-PESA Bill manager for organizations. M-PESA Bill Manager is a 
        * digital service that gives the business and customers a one-stop 
        * end-to-end platform to send, receive, pay and reconcile all payments.
        *
        * This is the first API used to opt you as a biller to our bill 
        * manager features. Once you integrate to this API and send a request 
        * with a success response, your shortcode is whitelisted and you 
        * are able to integrate with all the other remaining bill manager APIs.
        *
        * @typedef {Object} data
        * @property {string} app_key
        * @property {string} resmsg
        * @property {string} rescode
        *
        * @param {Object} param0 
        * @param {string} param0.shortcode - required
        * @param {string} param0.email - required
        * @param {number} param0.phone - required 07XXXXXXXX
        * @param {boolean} param0.send_reminders - 0 (False) or 1 (True) required
        * @param {string} param0.logo - JPEG, JPG optional
        * @param {string} param0.callbackURL - required
        *
        * @returns {data} 
        *
    * */
    async billManagerInvoiceOptin({
        shortcode,
        email,
        phone,
        send_reminders,
        logo,
        callbackURL
    }){
        try{
            return new Promise(async (resolve, reject)=>{
                const token = await this.generateToken();
                const merchantEndpoint = `${this.url}${this.urls.bill_manager_invoice_optin}`


                const darajaRequestBody = {  
                    "shortcode": `${shortcode}`,
                    "email":`${email}`,
                    "officialContact":`${phone}`,
                    "sendReminders":`${send_reminders ? 1 : 0}`,
                    "logo":`${logo}`,
                    "callbackurl":`${callbackURL}`
                }

                const requestHeaders = new Headers();
                requestHeaders.append("Content-Type","application/json")
                requestHeaders.append("Authorization", `Bearer ${token}`)

                const requestOptions = {
                    method : "POST",
                    headers: requestHeaders,
                    body: JSON.stringify(darajaRequestBody)
                }

                const request = new Request(merchantEndpoint, requestOptions)
                const response = await fetch(request)
                if(response.error){
                    console.error("Bill Manager Invoice Optin Error:", response.error)
                    reject(response.error)
                    return;
                }

                const data = await response.json();
                console.log("Successfully opted in Bill Manager Invoice")
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
        *
        * Bill Manager invoicing service enables you to create and 
        * send e-invoices to your customers. Single invoicing functionality 
        * will allow you to send out customized individual e-invoices. 
        * Your customers will receive this notification(s) via an SMS to 
        * the Safaricom phone number specified while creating the invoice.
        *
        * A customer can still opt to pay via USSD, Sim tool kit, M-PESA App, 
        * Safaricom App to your pay bill number as long as they reference 
        * the correct account number (account reference) as specified on 
        * the invoice.
        *
        * @typedef {Object} data
        * @property {string} Status_Message
        * @property {string} resmsg
        * @property {string} rescode
        *
        * @typedef {Object} invoice_item
        * @property {string} itemName
        * @property {string} amount
        *
        * @param {Object} param0 
        * @param {string} param0.external_reference 
        * @param {string} param0.customer_full_name 
        * @param {string} param0.customer_phone_number 
        * @param {string} param0.billed_period 
        * @param {string} param0.invoice_title 
        * @param {string} param0.due_date 
        * @param {string} param0.account_reference 
        * @param {string} param0.amount 
        * @param {invoice_item[]} param0.invoice_items 
        *
        * @returns {data}
        *
    * */
    async billManagerSingleInvoicing({
        external_reference,
        customer_full_name,
        customer_phone_number,
        billed_period,
        invoice_title,
        due_date,
        account_reference,
        amount,
        invoice_items
    }){
        try{
            return new Promise(async (resolve, reject)=>{
                const token = await this.generateToken();
                const merchantEndpoint = `${this.url}${this.urls.bill_manager_single_invoicing}`

                const darajaRequestBody =  {
                    "externalReference": `${external_reference}`,
                    "billedFullName":  `${customer_full_name}`,
                    "billedPhoneNumber":  `${customer_phone_number}`,
                    "billedPeriod":`${billed_period}`,
                    "invoiceName": `${invoice_title}`,
                    "dueDate":`${due_date}`,
                    "accountReference":`${account_reference}`,
                    "amount":`${amount}`,
                    "invoiceItems": [...invoice_items] || []
                } 

                const requestHeaders = new Headers();
                requestHeaders.append("Content-Type","application/json")
                requestHeaders.append("Authorization", `Bearer ${token}`)

                const requestOptions = {
                    method : "POST",
                    headers: requestHeaders,
                    body: JSON.stringify(darajaRequestBody)
                }

                const request = new Request(merchantEndpoint, requestOptions)
                const response = await fetch(request)
                if(response.error){
                    console.error("Bill Manager Single Invoicing Error:", response.error)
                    reject(response.error)
                    return;
                }

                const data = await response.json();
                console.log("Successfully created Bill Manager single invoice.")
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
        *
        * Bill Manager invoicing service enables you to create and send 
        * e-invoices to your customers. Single invoicing functionality will 
        * allow you to send out customized individual e-invoices. Your 
        * customers will receive this notification(s) via an SMS to the 
        * Safaricom phone number specified while creating the invoice.
        *
        * A customer can still opt to pay via USSD, Sim toolkit, M-PESA App,
        * Safaricom App to your paybill number as long as they reference 
        * the correct account number (account reference) as specified 
        * on the invoice.
        *
        * To send multiple e-invoices you specify the fields in the "bulk"
        * array section.
        *
        * You can send up to 1000 invoices for each call you make on the
        * bulk-invoice API.
        *
        * The appKey needs to be in the Header of every Service Request
        * provided to you during onboarding.
        *
        * @typedef {Object} data
        * @property {string} Status_Message
        * @property {string} resmsg
        * @property {string} rescode
        *
        * @typedef {Object} invoiceItem
        * @property {string} itemName
        * @property {string} amount
        *
        * @typedef {Object} invoice
        * @property {string} externalReference
        * @property {string} billedFullName
        * @property {string} billedPhoneNumber
        * @property {string} billedPeriod
        * @property {string} invoiceName
        * @property {string} dueDate
        * @property {string} accountReference
        * @property {string} amount
        * @property {invoiceItem[]} invoiceItems
        * 
        * @param {invoice[]} invoices 
        * @returns {data}
        *
        **/
    async billManagerBulkInvoicing(invoices){
        try{
            return new Promise(async (resolve, reject)=>{
                const token = await this.generateToken();
                const merchantEndpoint = `${this.url}${this.urls.bill_manager_bulk_invoicing}`

                const darajaRequestBody = invoices || [];

                const requestHeaders = new Headers();
                requestHeaders.append("Content-Type","application/json")
                requestHeaders.append("Authorization", `Bearer ${token}`)

                const requestOptions = {
                    method : "POST",
                    headers: requestHeaders,
                    body: JSON.stringify(darajaRequestBody)
                }

                const request = new Request(merchantEndpoint, requestOptions)
                const response = await fetch(request)
                if(response.error){
                    console.error("Bill Manager Bulk Invoicing Error:", response.error)
                    reject(response.error)
                    return;
                }

                const data = await response.json();
                console.log("Successfully created Bill Manager Bulk Invoices.");
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
        *
        * The bill manager payment feature enables your customers to receive 
        * e-receipts for payments made to your paybill account.
        *
        * Pre-Condition:
        * Your business pay bill must have been onboarded to bill manager 
        * for us to push payments to you and for bill manager to receive 
        * your payment acknowledgment details. Please see the bill manager 
        * onboarding documentation for more details.
        *
        * Bill Manager Payments flow.
        * 1.   An M-PESA Customer will make a C2B payment to your pay bill 
        *      number with the correct account number (account reference) 
        *      via the USSD, Sim tool kit, M-PESA App, Safaricom App, and 
        *      from the bill manager e-invoice.
        *
        * 2.   Bill Manager will receive the payment and push it to you 
        *      for acknowledgment via the call-back URL you provided during 
        *      onboarding. The payments will have the following structure.
        *
        * Important Information
        * 
        * We will try to send payment details 5 times to your callback URL 
        * before cancelling the request.
        *
        * @typedef {Object} data
        * @property {string} resmsg
        * @property {string} rescode
        *
        * @param {Object} param0 
        * @param {string} param0.transaction_id 
        * @param {string} param0.amount - KES 
        * @param {string} param0.customer_phone_number - 2547XXXXXXXX
        * @param {string} param0.date_created - YYYY-MM-DD
        * @param {string} param0.account_number 
        * @param {string} param0.short_code 
        *
        * @returns {data}
        *
    * */
    async billManagerReconciliation({
        transaction_id,
        amount,
        customer_phone_number,
        date_created, 
        account_number,
        short_code
    }){
        try{
            return new Promise(async (resolve, reject)=>{
                const token = await this.generateToken();
                const merchantEndpoint = `${this.url}${this.urls.bill_manager_reconciliation}`

                const darajaRequestBody  = {
                    "transactionId": `${transaction_id}`, 
                    "paidAmount":`{${amount}}`, 
                    "msisdn": `${customer_phone_number}`, 
                    "dateCreated":`${date_created}`, 
                    "accountReference": `${account_number}`, 
                    "shortCode": `${short_code}`
                }

                const requestHeaders = new Headers();
                requestHeaders.append("Content-Type","application/json")
                requestHeaders.append("Authorization", `Bearer ${token}`)

                const requestOptions = {
                    method : "POST",
                    headers: requestHeaders,
                    body: JSON.stringify(darajaRequestBody)
                }

                const request = new Request(merchantEndpoint, requestOptions)
                const response = await fetch(request)
                if(response.error){
                    console.error("Bill Manager Reconciliation Error:", response.error)
                    reject(response.error)
                    return;
                }

                const data = await response.json();
                console.log("Successfully created Bill Manager Reconciliation");
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
        *
        * The single cancel invoice API allows you to recall a sent invoice. 
        * This means the invoice will cease to exist and cannot be used as 
        * a reference to a payment.
        *
        * @typedef {Object} data
        * @property {string} Status_Message
        * @property {string} resmsg
        * @property {string} rescode
        * @property {Object} errors
        *
        * @param {string} externalReference 
        *
        * @returns {data}
        *
    * */
    async billManagerCancelSingleInvoicing(externalReference){
        try{
            return new Promise(async (resolve, reject)=>{
                const token = await this.generateToken();
                const merchantEndpoint = `${this.url}${this.urls.bill_manager_cancel_single_invoicing}`;
                const darajaRequestBody = { 
                    "externalReference":`${externalReference}`,
                }

                const requestHeaders = new Headers();
                requestHeaders.append("Content-Type","application/json")
                requestHeaders.append("Authorization", `Bearer ${token}`)

                const requestOptions = {
                    method : "POST",
                    headers: requestHeaders,
                    body: JSON.stringify(darajaRequestBody)
                }

                const request = new Request(merchantEndpoint, requestOptions)
                const response = await fetch(request)
                if(response.error){
                    console.error("Dynamic QR code Error:", response.error)
                    reject(response.error)
                    return;
                }

                const data = await response.json();
                console.log("Successfully created Dynamic QR code")
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
        *
        * The bulk cancel invoice API allows to recall more than one 
        * sent invoice.
        * @typedef {Object} data
        * @property {string} Status_Message 
        * @property {string} resmsg
        * @property {string} rescode
        * @property {string} errors
        *
        *
        * @typedef {Object} externalReference_t
        * @property {string} externalReference
        *
        * @param {externalReference_t[]} references 
        *
        * @returns {data}
        *
        *
    * */
    async billManagerCancelBulkInvoicing(references){
        try{
            return new Promise(async (resolve, reject)=>{
                const token = await this.generateToken();
                const merchantEndpoint = `${this.url}${this.urls.bill_manager_cancel_bulk_invoicing}`
                const darajaRequestBody =  [...references] || [];

                const requestHeaders = new Headers();
                requestHeaders.append("Content-Type","application/json")
                requestHeaders.append("Authorization", `Bearer ${token}`)

                const requestOptions = {
                    method : "POST",
                    headers: requestHeaders,
                    body: JSON.stringify(darajaRequestBody)
                }

                const request = new Request(merchantEndpoint, requestOptions)
                const response = await fetch(request)
                if(response.error){
                    console.error("Dynamic QR code Error:", response.error)
                    reject(response.error)
                    return;
                }

                const data = await response.json();
                console.log("Successfully created Dynamic QR code")
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
        *
        * This is the API used to update opt-in details.  
        *
        * Important Information
        *
        * You will use your Daraja access token for all the bill 
        * manager-integrated APIs.
        * You can use the same consumer key for multiple shortcodes 
        * that belong to that consumer key.
        *
        * @typedef {Object} data
        * @property {string} resmsg
        * @property {string} rescode
        *
        *@param {Object} param0 
        * @param {string} param0.short_code 
        * @param {string} param0.email 
        * @param {string} param0.phone = 07XXXXXXXX 
        * @param {boolean} param0.send_reminders - 0(False) or 1(True)
        * @param {string} param0.logo 
        * @param {string} param0.callback_url 
        *
        * @returns {data}
        *
    * */
    async billManagerUpdateOnBoardingDetails({
        short_code,
        email,
        phone,
        send_reminders,
        logo,
        callback_url
    }){
        try{
            return new Promise(async (resolve, reject)=>{
                const token = await this.generateToken();
                const merchantEndpoint = `${this.url}${this.urls.bill_manager_update_onboarding_details}`
                const darajaRequestBody = {
                    "shortcode": `${short_code}`,    
                    "email":`${email}`,    
                    "officialContact": `${phone}`,    
                    "sendReminders": send_reminders ? 1 : 0,    
                    "shortcode": `${short_code}`,    
                    "logo": `${logo}`,
                    "callbackurl": `${callback_url}`
                }

                const requestHeaders = new Headers();
                requestHeaders.append("Content-Type","application/json")
                requestHeaders.append("Authorization", `Bearer ${token}`)

                const requestOptions = {
                    method : "POST",
                    headers: requestHeaders,
                    body: JSON.stringify(darajaRequestBody)
                }

                const request = new Request(merchantEndpoint, requestOptions)
                const response = await fetch(request)
                if(response.error){
                    console.error("Dynamic QR code Error:", response.error)
                    reject(response.error)
                    return;
                }

                const data = await response.json();
                console.log("Successfully created Dynamic QR code")
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
        *
        * @typedef {Object} inventoryItem
        * @property {string} itemName
        * @property {string} amount
        *
        *
        * @param {Object} param0 
        * @param {string} param0.external_reference 
        * @param {string} param0.customer_full_name 
        * @param {string} param0.customer_phone - 07XXXXXXXX
        * @param {string} param0.billed_period - "Month Year"
        * @param {string} param0.invoice_title 
        * @param {string} param0.due_date - YYYY-MM-DD
        * @param {string} param0.account_number 
        * @param {string} param0.amount 
        * @param {inventoryItem[]} param0.invoice_items 
        *
    * */
    async billManagerUpdateSingleInvoicing({
        external_reference,
        customer_full_name,
        customer_phone,
        billed_period,
        invoice_title,
        due_date, 
        account_number,
        amount,
        invoice_items
    }){
        try{
            return new Promise(async (resolve, reject)=>{
                const token = await this.generateToken();
                const merchantEndpoint = `${this.url}${this.urls.bill_manager_single_invoicing}`
                const darajaRequestBody = {
                    "externalReference": `${external_reference}`,
                    "billedFullName":  `${customer_full_name}`,
                    "billedPhoneNumber":  `${customer_phone}`,
                    "billedPeriod": `${billed_period}`,
                    "invoiceName": `${invoice_title}`,
                    "dueDate": `${due_date}`,
                    "accountReference": `${account_number}`,
                    "amount": `${amount}`,
                    "invoiceItems": [...invoice_items] || []
                }

                const requestHeaders = new Headers();
                requestHeaders.append("Content-Type","application/json")
                requestHeaders.append("Authorization", `Bearer ${token}`)

                const requestOptions = {
                    method : "POST",
                    headers: requestHeaders,
                    body: JSON.stringify(darajaRequestBody)
                }

                const request = new Request(merchantEndpoint, requestOptions)
                const response = await fetch(request)
                if(response.error){
                    console.error("Dynamic QR code Error:", response.error)
                    reject(response.error)
                    return;
                }

                const data = await response.json();
                console.log("Successfully created Dynamic QR code")
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
    *
    * @typedef {Object} invoiceItem
    * @property {string} itemName
    * @property {string} amount
    *
    *
    * @typedef {Object} invoice
    * @property {string} externalReference
    * @property {string} billedFullName
    * @property {string} billedPhoneNumber
    * @property {string} billedPeriod
    * @property {string} invoiceName
    * @property {string} dueDate - YYYY-MM-DD HH:MM:SS.MS
    * @property {string} accountReference
    * @property {string} amount
    * @property {invoiceItem[]} invoiceItems
    * 
    * @param {invoice[]} invoices   
    *
    * */
    async billManagerUpdateBulkInvoicing(invoices){
        try{
            return new Promise(async (resolve, reject)=>{
                const token = await this.generateToken();
                const merchantEndpoint = `${this.url}${this.urls.bill_manager_bulk_invoicing}`

                const darajaRequestBody = [...invoices] || [];

                const requestHeaders = new Headers();
                requestHeaders.append("Content-Type","application/json")
                requestHeaders.append("Authorization", `Bearer ${token}`)


                const requestOptions = {
                    method : "POST",
                    headers: requestHeaders,
                    body: JSON.stringify(darajaRequestBody)
                }

                const request = new Request(merchantEndpoint, requestOptions)
                const response = await fetch(request)
                if(response.error){
                    console.error("Dynamic QR code Error:", response.error)
                    reject(response.error)
                    return;
                }

                const data = await response.json();
                console.log("Successfully created Dynamic QR code")
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
