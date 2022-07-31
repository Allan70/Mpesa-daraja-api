const transaction = {
    getTransactionInfo:(request)=>{
        
    const requestBody = request.body;
    let metaData = request.body.Body.stkCallback.CallbackMetadata;
    const transactionStatus = requestBody.Body.stkCallback.ResultDesc;
    
    let receipt = null;
    let transactionInfo = null;

    if(!metaData){
        receipt = {
            "message": "Transaction was unsuccessful"
        }

        transactionInfo = {
            "transactionStatus": transactionStatus,
            "receipt": receipt
        }
    
        return transactionInfo;
    }
    
    if(metaData){
    receipt = {
        "Amount": metaData.Item[0].Value,
        "mpesaReceiptNumber": metaData.Item[1].Value,
        "transactionDate": metaData.Item[2].Value,
        "phoneNumber": metaData.Item[3].Value
    }

    transactionInfo = {
        "transactionStatus": transactionStatus,
        "receipt": receipt
    }

    return transactionInfo;

    }

    // Handle the no account ballance exception
    if(!metaData && transactionStatus){
        transactionInfo = {
            "transactionStatus": transactionStatus,
            "message": "Customer has no funds"
        }
    
        return transactionInfo;
    
    }
   
    }
}

module.exports = transaction;