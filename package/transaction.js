const transaction = {
    getTransactionInfo:(request)=>{
        
    const requestBody = request.body;
    const metaData = request.body.Body.stkCallback.CallbackMetadata;

    const receipt = {
        "Amount": metaData.Item[0].Value,
        "mpesaReceiptNumber": metaData.Item[1].Value,
        "transactionDate": metaData.Item[2].Value,
        "phoneNumber": metaData.Item[3].Value
    }

    const transactionStatus = requestBody.Body.stkCallback.ResultDesc;

     
    console.log(receipt);
    console.log(transactionStatus);

    const transactionInfo = {
        "transactionStatus": transactionStatus,
        "receipt": receipt
    }

    return transactionInfo;
    }
}