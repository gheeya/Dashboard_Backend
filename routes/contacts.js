const express = require('express')
const multer = require('multer')
const path = require('node:path')
const storage = multer.diskStorage({
    destination : 'uploads/csv',
    filename : function (req,file,cb) {
        const fileExtension = file.mimetype.split('/').pop()
        const uniqueFilename = `${Date.now()}_${file.originalname}`
        cb(null,uniqueFilename)
    }
})
const upload = multer({
    storage : storage,
    fileFilter: (req, file, cb) => {
        const extension = path.extname(file.originalname)
        if (extension !== ".csv") {
            cb(null, false)
            req.isValidFile = false
            return
        }
        req.isValidFile = true
        cb(null, true)
    }
})
const {Contact, validateContactsRequest} = require('../models/contact')
const { insertContactsInDB, checkDuplicatesInList, fetchContactsForCustomer, validateCSV, insertManyContactsInDBForCustomer, createExcelFileForContacts, deleteManyContactsForUser } = require('../utils/contacts')
const { Customer } = require('../models/customer')
const { attachCustomer, attachCustomerForDelete, attachCustomerForForm, attachCustomerForGet } = require('../middleware/customer')
const { validateInsertViaCSVRequestBody } = require('../middleware/contacts')

const router = express.Router()

router.use(express.urlencoded())

//Migrate to use attach customer middleware
router.post('/insert',attachCustomer,async(req,res)=>{
    if(!req.body.user_id){
        res.status(400).send({
            success : false,
            message : "user_id required"
        })
        return
    }

    try {
        const validationResult = validateContactsRequest(req.body.contacts)
        if(validationResult.error){
            res.status(400).send({
                success : false,
                message : "Bad request",
                error : {
                    detail : validationResult.error.message
                }
            })
            return
        }
    
        if(await checkDuplicatesInList(req.body.user_id,req.body.contacts)){
            res.status(409).send({
                success: false,
                message : "At least on contact is a duplicate, please edit the list."
            })
            return
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


    try{
        const savedContactsIds = await insertContactsInDB(req.body.contacts)
        try {
            req.customer.contacts = req.customer.contacts.concat(savedContactsIds)
            await req.customer.save()
            res.status(200).send({
                success : true,
                message : "contacts inserted successfully."
            })
            return
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


router.post('/insert_via_csv',upload.single('contacts_file'),validateInsertViaCSVRequestBody,attachCustomerForForm,async (req,res)=>{
    if(!req.isValidFile){
            res.status(400).send({
                success : false,
                message : "Only CSV files are allowed. Also check if the file is being sent."
            })
            return
    }
    try {
        const validationRes = await validateCSV(path.join(__dirname,'..',req.file.path))
            if(validationRes.isValid === false) {
                res.status(400).send({
                    success : false,
                    csv_file_status : validationRes
                })
                return
            }
        try {
            await insertManyContactsInDBForCustomer(req.customer,validationRes.data)
            res.status(200).send({
                success : true,
                message : "All contacts inserted successfully."
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
    }catch(err) {
        res.status(500).send({
            success : false,
            message : "Internal server error",
            error : {
                detail : err.message
            }
        })
    }
})

router.get('/for_user/:user_id',async(req,res)=>{
    try {

        const contacts = await fetchContactsForCustomer(req.params.user_id)
        res.status(200).send({
            success:true,
            data : {
                contacts : contacts
            }
        })
        return

    }catch(err){
        res.status(404).send({
            success : false,
            error : {
                detail : err.message
            }
        })
    }
})


router.delete('/remove/:user_id/:contact_id', attachCustomerForDelete,async (req,res)=>{

    try{

        const contact = await Contact.deleteOne({_id:req.params.contact_id}).exec()
        if(contact.deletedCount===0){
            res.status(404).send({
                success: false,
                message : "Contact with this id does not exist."
            })
            return  
        }
        req.customer.contacts = req.customer.contacts.filter((val)=>val!=req.params.contact_id)
        await req.customer.save()
        res.status(200).send({
            success : true,
            message : "Deletion successfull"
        })
    }catch(err){

        if(err.message.startsWith("BAD_FILE")){
            res.status(400).send({
                success : false,
                message : "Bad request",
                error : {
                    detail : err.message
                }
            })
            return
        }
        res.status(500).send({
            success: false,
            message : "Internal server error",
            error : {
                detail : err.message
            }
        })
        return
    }

})

router.put('/update', async(req,res)=>{
    try{

        const contact = await Contact.findOne({_id : req.body.contact._id}).exec()
        if(!contact){
            res.status(404).send({
                success : false,
                message : "No such user exists."
            })
            return
        }

        for(key in req.body.contact){
            contact[key] = req.body.contact[key]
        }
        try{
            await contact.save()
        }catch(err){
            res.status(500).send({
                success : true,
                message : "Internal server error",
                error : {
                    detail : err.message
                }
            })
        }
        
        res.status(200).send({
            success : true,
            message : "Contact updated succesfully"
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

router.get('/excel_for_user/:user_id',attachCustomerForGet,async (req,res)=>{
    try{

        const excelFilePath = await createExcelFileForContacts(req.customer,req.query.contacts)
        res.status(200).sendFile(excelFilePath)
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

router.delete('/remove_many/:user_id',attachCustomerForDelete,async (req,res)=>{
    try {
        await deleteManyContactsForUser(req.customer,req.query.contacts)
        res.status(200).send({
            success : true,
            message : "Contacts deleted successfully"
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