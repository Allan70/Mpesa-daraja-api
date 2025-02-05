import Mpesa from "./Mpesa"

function mpesa({callbackURL, secret, consumer_key, mpesa_base_url}){
    if(!mpesa_base_url || mpesa_base_url === "")
        return new Mpesa({callbackURL, secret, consumer_key })

    return new Mpesa({callbackURL, secret, consumer_key, mpesa_base_url})
}

export { mpesa as default }