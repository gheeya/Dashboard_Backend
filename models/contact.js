const mongoose = require('mongoose')
const Joi = require('joi')
const _ = require('lodash')



const Contact = new mongoose.model('contacts', new mongoose.Schema({
    first_name : {
        type : String
    },
    last_name : {
        type : String
    },
    phone : {
        type : String,
        required : true,
        maxLength : 10,
        minLength : 10
    },
    country_code : {
        type : String,
        required : true
    },
    email : {
        type : String
    }
}))


function validateContactsRequest(contactsRequest) {

    const contactObject= Joi.object({
        phone : Joi.string().required(),
        country_code : Joi.string().required(),
        first_name : Joi.string().allow(null,''),
        last_name : Joi.string().allow(null,''),
        email : Joi.string().email().allow(null,'')
    })

    const contactsRequestObject = Joi.array().items(contactObject)

    return contactsRequestObject.validate(contactsRequest)

}

module.exports = {
    Contact,
    validateContactsRequest
}