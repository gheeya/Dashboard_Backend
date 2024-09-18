const { Customer } = require("../models/customer");

//Combine all these functions


async function attachCustomer(req,res,next) {
    try{
        const customer = await Customer.findOne({user_id:req.body.user_id}).exec()
        if(!customer){
            res.status(404).send({
                success : false,
                message : "No such user exists"
            })
            return
        }
        req.customer = customer
        next()
    }catch(err){
        res.status(500).send({
            success : false,
            message : "Internal server error",
            error : {
                detail : err.message
            }
        })
    }

}

//Combine these two functions
async function attachCustomerForGet(req,res,next) {
    try{
        const customer = await Customer.findOne({user_id:req.params.user_id}).exec()
        if(!customer){
            res.status(404).send({
                success : false,
                message : "No such user exists"
            })
            return
        }
        req.customer = customer
        next()

    }catch(err){
        res.status(500).send({
            success : false,
            message : "Internal server error",
            error : {
                detail : err.message
            }
        })
    }

}

async function attachCustomerForDelete(req,res,next) {
    try{
        const customer = await Customer.findOne({user_id:req.params.user_id}).exec()
        if(!customer){
            res.status(404).send({
                success : false,
                message : "No such user exists"
            })
            return
        }
        req.customer = customer
        next()

    }catch(err){
        res.status(500).send({
            success : false,
            message : "Internal server error",
            error : {
                detail : err.message
            }
        })
    }

}

async function attachCustomerForForm(req,res,next) {
    try{
        const customer = await Customer.findOne({user_id:req.body.user_id}).exec()
        if(!customer){
            res.status(404).send({
                success : false,
                message : "No such user exists"
            })
            return
        }
        req.customer = customer
        next()

    }catch(err){
        res.status(500).send({
            success : false,
            message : "Internal server error",
            error : {
                detail : err.message
            }
        })
    }

}

module.exports= {
    attachCustomer,
    attachCustomerForGet,
    attachCustomerForDelete,
    attachCustomerForForm
}