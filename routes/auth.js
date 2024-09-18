const express = require('express')
const { Customer } = require('../models/customer')
const _ = require('lodash')

const router = express.Router()

router.post('/login',async (req,res)=>{
    try{
        const customer = await Customer.findOne({user_id:req.body.user_id}).exec()
        if(!customer) {
            res.status(404).send({
                success :false,
                message : "No such user exists"
            })
            return
        }
    
        res.status(200).send({
            success : true,
            message : "User logged in successfully",
            data : _.omit(customer.toObject(),["access_token","contacts"])
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


module.exports = router