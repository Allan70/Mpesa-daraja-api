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

            receiptInfo = {
                "amount": metaData.Item[0].Value,
                "mpesaReceiptNumber": metaData.Item[1].Value,
                "transactionDate": metaData.Item[2].Value,
                "phoneNumber": metaData.Item[3].Value
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