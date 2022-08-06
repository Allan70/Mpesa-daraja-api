const transaction = {
    getTransactionInfo: (request) => {

        const requestBody = request.body;

        let metaData;
        let transactionStatus;

        let receiptInfo;
        let transactionInfo;

        try {
            transactionStatus = requestBody.Body.stkCallback.ResultDesc;
            metaData = requestBody.Body.stkCallback.CallbackMetadata;

            console.log(metaData);

            receiptInfo = {
                "Amount": metaData.Item[0].Value,
                "MpesaReceiptNumber": metaData.Item[1].Value,
                "TransactionDate": metaData.Item[3].Value,
                "PhoneNumber": metaData.Item[4].Value
            }

            transactionInfo = {
                "transactionStatus": transactionStatus,
                "receipt": receiptInfo
            }

            return transactionInfo;

        } catch (err) {

            receiptInfo = {
                "message": "Transaction was unsuccessful",
                "error": err.message
            }

            transactionInfo = {
                "Error": receiptInfo
            }

            return transactionInfo;
        }
    }

}


module.exports = transaction;