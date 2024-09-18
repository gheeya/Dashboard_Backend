const express = require('express')
const config = require('config')
const mongoose = require('mongoose')
const cors = require('cors')
const contacts = require('./routes/contacts')
const customers = require('./routes/customers')
const media = require('./routes/media')
const messages = require('./routes/messages')
const auth = require('./routes/auth')
const templates = require('./routes/templates')

const app = express()

mongoose.connect(config.get("db"))
    .then(()=>console.log(`Successfully connected to database ${config.get('db')}`))
    .catch((err)=>console.log('Connection failed',err))


app.use(cors({
    origin : ['http://localhost:3000','http://localhost:3001']
}))
app.use(express.json())

app.use('/api/contacts',contacts)
app.use('/api/customers',customers)
app.use('/api/media',media)
app.use('/api/messages',messages)
app.use('/api/auth',auth)
app.use('/api/templates',templates)

const port = process.env.PORT || 6060
app.listen(port,()=>{console.log(`Listening on port ${port}`)})