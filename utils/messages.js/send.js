const axios = require('axios')
const config = require('config')


async function sendMessageFreeFormText(params) {

    try {

        const response = await axios({
            method : "post",
            url : config.get('graphAPIURL') + config.get('graphAPIVersion') + `/${params.phoneNumberId}` + '/messages',
            headers : {
                'Authorization' : `Bearer ${params.accessToken}`
            },
            data : {
                messaging_product : "whatsapp",
                recipient_type : "individual",
                to : params.toPhoneNumber,
                type : "text",
                text : {
                    preview_url : "false",
                    body : params.messageBody
                }
            }
        })
        if(response.data.messages[0].id.startsWith("wamid")){
            return {
                success : true,
                message : "Sent succesfully",
                data : response.data
            }
        }
        return {
            success : false,
            message : "Sent unsuccessfully",
            data : response.data
        }

    }catch(err){
        console.log(err)
        throw new Error(err.message)
    }

}

async function sendMessageWithImage(params){
    try {
        //Replace phone number id with the request field
        //Replace the access token with the fetched one, make a middleware
        console.log(params)
        const response = await axios({
            method : "post",
            url : config.get('graphAPIURL') + config.get('graphAPIVersion') + `/${params.phoneNumberId}` + '/messages',
            headers : {
                'Authorization' : `Bearer ${params.accessToken}`
            },
            data : {
                messaging_product : "whatsapp",
                recipient_type : "individual",
                to : params.toPhoneNumber,
                type : "image",
                image : {
                    link : config.get('testPublicDomain') + '/api/media' +'/' + params.filename,
                    ...(params.caption) && {caption : params.caption}
                }
            }
        })
        //Add code to check wamid in messages id
        return response.data

    }catch(err){
        console.log(err)
        throw new Error(err.message)
    }
}

module.exports = {
    sendMessageWithImage,
    sendMessageFreeFormText
}