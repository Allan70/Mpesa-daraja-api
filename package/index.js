import Mpesa from "./Mpesa.js"

function mpesa({callbackURL, consumerSecret, consumerKey, passKey,  mpesaBaseUrl}){
    if(!mpesaBaseUrl || mpesaBaseUrl === "")
        return new Mpesa({callbackURL, consumerSecret,consumerKey, passKey})

    return new Mpesa({ callbackURL, consumerSecret, consumerKey, passKey, mpesaBaseUrl})
}

export { mpesa as default }