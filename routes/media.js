const express = require('express')
const config = require('config')
const path = require('node:path')
const fs = require('node:fs/promises')

const router = express.Router()

const uploadsDir = './/uploads/images'

router.get('/:media_url',async (req,res)=>{
    const filePath = path.join(__dirname,'..',uploadsDir,req.params.media_url)
    try {
        await fs.access(filePath)
        res.download(filePath)
    }catch(err){
        res.status(404).send({
            success : false,
            message : "No such file exists",
            error : {
                detail : err.message
            }
        })
        return
    }
})

module.exports = router