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
            const secretGen = this.secret;
            const consumerKeyGen = this.consumer_key;
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

    async express({phone, amount, tillOrPayBillNumber, account_reference, transaction_desc}){
        try{
            return new Promise(async (resolve, reject)=>{
                const token = await this.generateToken()
                const phoneNumber = phone; //Starts with 254 eg. 254708374149
                const amountFromUser = amount;
                const businessNumber = tillOrPayBillNumber; //your paybill
                const mpesaPassword = this.mpesaPassword;
                // const merchantEndPoint = `${this.url}/mpesa/stkpush/v1/processrequest`; // change the sandbox to api during production
                const merchantEndPoint = `${this.url}${this.urls.express_stk_push}`; // change the sandbox to api during production
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

    async expressPushQuery(){
        try{
        }catch(error){
            console.error({
                message: error.message,
                code: error.code
            })
        }
    }


    async reversal(){
        try{
        }catch(error){
            console.error({
                message: error.message,
                code: error.code
            })
        }
    }

    async customerToBusinesss(){
        try{
        }catch(error){
            console.error({
                message: error.message,
                code: error.code
            })
        }
    }

    async customerToBusinessPaybill(){
        try{
        }catch(error){
            console.error({
                messsage: error.message,
                code: error.code
            })
        }
    }

    async transactionStatus(){
        try{
        }catch(error){
            console.error({
                message: error.message,
                code: error.code
            })
        }
    }

    async accountBalance(){
        try{
        }catch(error){
            console.error({
                message: error.message,
                code: error.code
            })
        }
    }

    async businessToCustomer(){
        try{
        }catch(error){
            console.error({
                message: error.message,
                code: error.code
            })
        }
    }

    async businessToCustomerTransactionStatus(){
        try{
        }catch(error){
            console.error({
                message: error.message,
                code: error.code
            })
        }
    }

    async businessToCustomerAccountBalance(){
        try{
        }catch(error){
            console.error({
                message: error.message,
                code: error.code
            })
        }
    }

    async businessToBusinessBuyGoods(){
        try{
        }catch(error){
            console.error({
                message: error.message,
                code: error.code
            })
        }
    }

    async businessToBusinessPaybill(){
        try{
        }catch(error){
            console.error({
                message: error.message,
                code: error.code
            })
        }
    }

    async businessToBusinessAccountTopup(){
        try{
        }catch(error){
            console.error({
                message: error.message,
                code: error.code
            })
        }
    }

    async dynamicQRCode(){
        try{
        }catch(error){
            console.error({
                message: error.message,
                code: error.code
            })
        }
    }

    async billManagerInvoiceOptin(){
        try{
        }catch(error){
            console.error({
                message: error.message,
                code: error.code
            })
        }
    }

    async billManagerSingleInvoicing(){
        try{
        }catch(error){
            console.error({
                message: error.message,
                code: error.code
            })
        }
    }

    async billManagerBulkInvoicing(){
        try{
        }catch(error){
            console.error({
                message: error.message,
                code: error.code
            })
        }
    }

    async billManagerReconciliation(){
        try{
        }catch(error){
            console.error({
                message: error.message,
                code: error.code
            })
        }
    }

    async billManagerCancelSingleInvoicing(){
        try{
        }catch(error){
            console.error({
                message: error.message,
                code: error.code
            })
        }
    }

    async billManagerCancelBulkInvoicing(){
        try{
        }catch(error){
            console.error({
                message: error.message,
                code: error.code
            })
        }
    }

    async billManagerUpdateOnBoardingdetails(){
        try{
        }catch(error){
            console.error({
                message: error.message,
                code: error.code
            })
        }
    }

    async billManagerUpdateSingleInvoicing(){
        try{
        }catch(error){
            console.error({
                message: error.message,
                code: error.code
            })
        }
    }

    async billManagerUpdateBulkInvoicing(){
        try{
        }catch(error){
            console.error({
                message: error.message,
                code: error.code
            })
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
