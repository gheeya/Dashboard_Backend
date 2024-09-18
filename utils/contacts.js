const { Contact } = require('../models/contact')
const { Customer } = require('../models/customer')
const _ = require("lodash")
// const dfd = require('danfojs-node')
const path= require('node:path')
const fs = require('node:fs')

async function checkDuplicatesInList(user_id,_contacts) {
    try {
        let hasDuplicates=false

        const customer = await Customer.findOne({user_id:user_id}).exec()
        let contacts = await Contact.find({_id : { $in : customer.contacts}}).exec()
        contacts = contacts.map((val)=>val.country_code+val.phone)
        console.log(contacts)
        const contactsToFind = _contacts.map((val)=>val.country_code+val.phone)
        console.log(contactsToFind)
    
        for(let contact of contactsToFind) {
            if(contacts.includes(contact)){
                hasDuplicates=true
                break
            }
        }
        console.log(hasDuplicates)
        return hasDuplicates

    }catch(err){
        throw new Error(err.message)
    }

}


//Try insert many here
async function insertContactsInDB(contacts)  {

    const savedContacts = []
    for(const contact of contacts){
        try{
            const aContact = await Contact(contact).save()
            savedContacts.push(aContact._id)
        }catch(err){
            throw new Error(err.message,{cause : {err}})
        }
    }
    return savedContacts
}

async function fetchContactsForCustomer(user_id){

    try {

        const customer = await Customer.findOne({user_id:user_id}).exec()
        if(!customer){
            throw new Error("No such customer with this id")
        }
        const contacts = await Contact.find({_id : {$in : customer.contacts}}).exec()
        return contacts

    }catch(err){
        throw new Error(err.message)
    }


}

async function fetchContactsHavingIds(_contacts) {
    try {
        const contacts = await Contact.find({_id : {$in : _contacts}}).exec()
        return contacts
    }catch(err){
        throw err
    }

}

// async function validateCSV(filePath) {
//     try {
//         let df = await dfd.readCSV(filePath)
//         if(!df.column("country_code") || !df.column("phone") || !df.column("first_name") || !df.column("last_name") || !df.column("email")){
//             return {
//                 isValid : false,
//                 message : "Bad file",
//                 error : {
//                     detail : `Bad CSV file, required columns are country_code, first_name, last_name, phone, email.`
//                 }
//             }
//         }
//         df.fillNa("",{inplace:true})
//         const test = df.query(df["country_code"].ne("").and(df["phone"].ne('')))
//         const csvJson = dfd.toJSON(test)
//         console.log(csvJson)
//         return {
//             isValid : true,
//             data : csvJson
//         }
//     }catch(err){
//         if(err.message.startsWith("ParamError")){
//             throw new Error(`BAD_FILE : Bad CSV file, required columns are country_code, first_name, last_name, phone, email.`)
//         }
//         throw new Error(err.message)
//     }
// }


async function insertManyContactsInDBForCustomer(customer,contacts) {
    try {
        const editedContacts = contacts.map((val,idx)=>({...val,country_code : `+${val.country_code}`}))
        const savedContacts = await Contact.insertMany(editedContacts)
        console.log(savedContacts)
        customer.contacts = customer.contacts.concat(savedContacts.map((val)=>val._id))
        await customer.save()
    }catch(err){
        throw new Error(err.message)
    }
}

// async function createExcelFileForContacts(customer,contacts) {
//     try{

//         let contactsToExport = await fetchContactsHavingIds(contacts)
//         contactsToExport = contactsToExport.map((val)=>_.omit(val.toObject(),["_id","__v"]))
//         const df = new dfd.DataFrame(contactsToExport)
//         const filePath = path.join(__dirname,"..","sendToUser/excelFiles",customer.user_id+Date.now()+'contacts.xlsx')
//         dfd.toExcel(df,{filePath : filePath})
//         return filePath
//     }catch(err){
//         console.log(err)
//         throw err
//     }
// }


async function deleteManyContactsForUser(customer, contacts) {
    try {
        const operationResult = await Contact.deleteMany({_id : {$in : contacts}}).exec()
        customer.contacts = customer.contacts.filter((val,idx)=>contacts.includes(val)===false)
        await customer.save()
    }catch(err){
        console.log(err)
        throw err
    }
}

module.exports = {
    insertContactsInDB,
    checkDuplicatesInList,
    fetchContactsForCustomer,
    // validateCSV,
    insertManyContactsInDBForCustomer,
    // createExcelFileForContacts,
    deleteManyContactsForUser
}