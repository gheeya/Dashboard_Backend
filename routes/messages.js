const express = require('express')
const multer = require('multer')
const { attachCustomer } = require('../middleware/customer')
const { getAccessToken } = require('../utils/customers')
const { sendMessageWithImage, sendMessageFreeFormText } = require('../utils/messages.js/send')
const path = require('node:path')
const storage = multer.diskStorage({
    destination : 'uploads/images',
    filename : function (req,file,cb) {
        const fileExtension = file.mimetype.split('/').pop()
        const uniqueFilename = `${Date.now()}_${file.fieldname}.${fileExtension}`
        cb(null,uniqueFilename)
    }
})
const upload = multer({
        storage : storage
})

const router = express.Router()


router.post('/send_free_form_text',attachCustomer,async(req,res)=>{
    if(!req.customer.access_token) {
        res.status(404).send({
            success : false,
            message : "No such user found"
        })
        return
    }

    try {

        const messageResponse = await sendMessageFreeFormText({
            toPhoneNumber : req.body.to_phone_number,
            phoneNumberId : req.body.phone_number_id,
            accessToken : req.customer.access_token,
            messageBody : req.body.message_body
        })
        res.status(200).send(messageResponse)

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

router.post('/send_image',upload.single('image_file'),async (req,res)=>{
    try {

        const accessTokenObj = await getAccessToken(req.body.user_id)
        if(!accessTokenObj){
            //Add cleanup code to delete the uploaded file
            res.status(404).send({
                success : false,
                message : "No such user found"
            })
            return
        }

        if(!accessTokenObj.accessToken){
            //Add cleanup code to delete the uploaded file
            res.status(401).send({
                success : false,
                message : "Invalid or missing credentials."
            })
            return            
        }

        const messageResponse = await sendMessageWithImage({
            ...(req.body.caption) && {caption:req.body.caption},
            toPhoneNumber : req.body.to_phone_number,
            phoneNumberId:req.body.phone_number_id,
            accessToken : accessTokenObj.accessToken,
            filename : req.file.filename

        })

        console.log(messageResponse)
        res.status(200).send({
            success : true,
            message : "Message sent successfully",
            data : messageResponse
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