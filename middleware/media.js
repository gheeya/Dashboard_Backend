function attachOtherField(req,res,next){
    console.log('-----',req.body)
    next()
}


module.exports = {
    attachOtherField
}