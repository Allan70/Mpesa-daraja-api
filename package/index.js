import Mpesa from "./Mpesa"

export default function Mpesa({callbackURL, secret, consumer_key, mpesa_base_url}){
    return new Mpesa({callbackURL, secret, consumer_key, mpesa_base_url})
}