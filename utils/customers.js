const { Customer } = require("../models/customer")
const axios = require('axios')
const config = require('config')

async function getAccessToken(userId) {
    try {
        const customer = await Customer.findOne({user_id:userId}).exec()
        console.log(customer)
        if(!customer){
            return null
        }
        return {
            accessToken : customer.access_token
        }
    }catch(err){
        throw new Error(`DB ERROR : ${err.message}`)
    }

}



module.exports = {
    getAccessToken
}