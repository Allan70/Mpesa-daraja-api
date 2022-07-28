const axios = require('axios');

const generateToken = async (req, res, next) => {

    const secret = process.env.MPESA_SECRET_KEY;
    const consumerKey = process.env.MPESA_CONSUMER_KEY;

    const auth = new Buffer.from(`${consumerKey}:${secret}`).toString("base64");

    await axios.get("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
        headers: {
            "Authorization": `Basic ${auth}`
        },
    }).then((response) => {
        // console.log(response.data.access_token);
        token = response.data.access_token;
        next();
    }).catch((err) => {
        console.log(err);
        res.status(400).json(err.message);
    })
}

module.exports = generateToken;