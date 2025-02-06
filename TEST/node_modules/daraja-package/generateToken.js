const axios = require('axios');

const generateToken = async (req, res, next) => {
    try{
        const secret = process.env.MPESA_SECRET_KEY;
        const consumerKey = process.env.MPESA_CONSUMER_KEY;
    
        const auth = new Buffer.from(`${consumerKey}:${secret}`).toString("base64");
    
        await axios.get("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
            headers: {
                "Authorization": `Basic ${auth}`
            },
        }).then((response) => {
            token = response.data.access_token;
            next();
        }).catch((err) => {
            throw new Error(err)
        })
    }catch(error){
        console.log({message: error.message, code: error.code})
    }

}

export default generateToken;