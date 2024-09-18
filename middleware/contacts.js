function validateInsertViaCSVRequestBody(req,res,next) {
    const requiredFields = ["user_id"].sort()
    const requestKeys = Object.keys(req.body).sort()
    if (JSON.stringify(requiredFields) === JSON.stringify(requestKeys)){
        next()
    } else {
        res.status(400).send({
            success : false,
            message : "Check the form fields",
            error : {
                detail : `Expected fields ${(requiredFields)} got ${requestKeys.length===0? "nothing" : requestKeys}`
            }
        })
        return
    }
}

module.exports = {
    validateInsertViaCSVRequestBody
}