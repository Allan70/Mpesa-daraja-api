import Mpesa from "./Mpesa.js"

function mpesa({callbackURL, consumerSecret, consumerKey, mpesa_base_url}){
    if(!mpesa_base_url || mpesa_base_url === "")
        return new Mpesa({callbackURL, consumerSecret, consumerKey })

    return new Mpesa({callbackURL, consumerSecret, consumerKey, mpesa_base_url})
}

export { mpesa as default }