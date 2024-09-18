const axios = require('axios')
const config = require('config')
const _ = require('lodash')

async function savePhoneNumberIdsToDB(customer) {
    try{

        const response = await axios({
            method : "get",
            url : config.get('graphAPIURL') + config.get('graphAPIVersion') + `/${customer.whatsapp_business_account_id}` + '?fields=phone_numbers',
            headers : {
                'Authorization' : `Bearer ${customer.access_token}`
            }

        })

        for(const phoneNumber of response.data.phone_numbers.data){
            customer.phone_number_ids.push(phoneNumber.id)
        }

        await customer.save()

    }catch(err){
        console.log(err)
        throw new Error(err.message)
    }
}

async function getPhoneNumberForId(phoneNumberId, accessToken){

    try {
        const response = await axios({
            method : "get",
            url : config.get('graphAPIURL') + config.get('graphAPIVersion') + `/${phoneNumberId}`,
            headers : {
                "Authorization" : `Bearer ${accessToken}`
            }
        })
        return {
            name : response.data.verified_name,
            phone_number : response.data.display_phone_number
        }

    }catch(err){
        throw new Error(err.message)
    }
}

async function getPhoneNumbersForCustomer(customer) {
    try{

        const response = await axios({
            method : "get",
            url : config.get('graphAPIURL') + config.get('graphAPIVersion') + `/${customer.whatsapp_business_account_id}` + '?fields=phone_numbers',
            headers : {
                'Authorization' : `Bearer ${customer.access_token}`
            }

        })

        const phoneNumbers = []

        for(const phoneNumber of response.data.phone_numbers.data){
            phoneNumbers.push(_.pick(phoneNumber,["verified_name","display_phone_number","id"]))
        }

       return phoneNumbers

    }catch(err){
        console.log(err)
        throw new Error(err.message)
    }
}

module.exports = {
    getPhoneNumberForId,
    savePhoneNumberIdsToDB,
    getPhoneNumbersForCustomer
}