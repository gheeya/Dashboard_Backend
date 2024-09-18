const mongoose = require('mongoose')
const Joi = require('joi')
const _ = require('lodash')


const Customer = new mongoose.model('customers',new mongoose.Schema({
    user_id : {
        type : String,
        required : true,
        unique : true
    },
    access_token : {
        type : String
    },
    phone_number_ids  : {
        type : [String]
    },
    contacts : {
        type : [{type: mongoose.Schema.ObjectId, ref : 'contacts'}]
    },
    whatsapp_business_account_id : {
        type : String
    }

}))


function validateCustomerRequest(customerRequest){
    const customerRequestObject = Joi.object({
        user_id : Joi.string().required(),
        access_token : Joi.string()
    })
    return customerRequestObject.validate(customerRequest)
}

module.exports = {
    Customer,
    validateCustomerRequest
}