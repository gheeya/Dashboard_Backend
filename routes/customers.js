const express = require('express')
const { Customer, validateCustomerRequest } = require('../models/customer')
const { attachCustomer, attachCustomerForGet } = require('../middleware/customer')
const { savePhoneNumberIdsToDB, getPhoneNumbersForCustomer } = require('../utils/phoneNumbers')
const _ = require('lodash')
const router = express.Router()


//Depracte this once the embedded signup flow is setup
router.post('/whatsapp_business_account_id',attachCustomer,async(req,res)=>{
    try {

        req.customer.whatsapp_business_account_id = req.body.whatsapp_business_account_id
        await req.customer.save()
        try {

            await savePhoneNumberIdsToDB(req.customer)
            res.status(200).send({
                success : true,
                message : 'Phone number ids and whatsapp business id added successfully'
            })

        }catch(err){
            res.status(500).send({
                success : false,
                message : "Internal server error",
                error : {
                    detail : err.message
                }
            }) 
            return
        }


    }catch(err){
        res.status(500).send({
            success : false,
            message : "Internal server error",
            error : {
                detail : err.message
            }
        })
    }
})

router.post('/register',async (req,res)=>{
    try{

        const validateRequest = validateCustomerRequest(req.body)
        if(validateRequest.error) {
            res.status(400).send({
                success : false,
                message : "Bad request",
                error : {
                    detail : validateRequest.error.message
                }
            })
            return
        }

        const customer = await Customer.findOne({user_id:req.body.user_id}).exec()
        if(customer){
            res.status(409).send({
                success : false,
                message : "User already exists with this id."
            })
            return
        }

        try {

            const newCustomer = await Customer(req.body).save()
            res.status(200).send({
                success : true,
                message : "User created successfully"
            })

        }catch(err){
            res.status(500).send({
                success : false,
                message : "internal server error",
                error : {
                    detail : err.message
                }
            })
        }



    }catch(err){
        res.status(500).send({
            success : false,
            message : "internal server error",
            error : {
                detail : err.message
            }
        })
    }
})


router.get('/phone_numbers/:user_id',attachCustomerForGet,async (req,res)=>{
    try{

        const phoneNumbers = await getPhoneNumbersForCustomer(req.customer)
        res.status(200).send({
            success : true,
            data : {
                phone_numbers : phoneNumbers
            }
        })

    }catch(err){
        res.status(500).send({
            success : false,
            message : "Internal server error",
            error : {
                detail : err.message
            }
        })
    }
})

router.get('/:user_id',attachCustomerForGet,async (req,res)=>{
    res.status(200).send({
        success:true,
        data : {
            user : _.omit(req.customer.toObject(),["__ver,_id,access_token"])
        }
    })
})

module.exports = router