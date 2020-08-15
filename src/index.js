const express = require('express')
const cors = require('cors')
const convert = require('xml-js')
const request = require('request')
const { json } = require('express')
const fetch = require('node-fetch')
const URL = 'https://10.2.0.2:86/rk7api/v0/xmlinterface.xml'
const https = require('https')
const app = express()

app.use(express.json())
app.use(cors())
app.use(express.urlencoded({extended: false}))

app.post('/', async(req, res) => {
    
    const login = req.headers.login
    
    request.post(URL, {
        method: "POST",
        auth: { user: 'Wilde', password: '1024' },
        rejectUnauthorized: false,
        agent: false,
        secureProtocol: 'TLSv1_method',
        headers:{
            "Content-Type" : "text/xml",
            'Authorization': 'Basic ' + login
        },
    
        body: `<?xml version="1.0" encoding="windows-1251"?>
                    <RK7Query>
                        <RK7CMD CMD="GetWaiterList" registeredOnly="1"/>
                    </RK7Query>` 

    }, (err, response, body) => {
        if (err) { 
            console.log(err)
            res.send({error: true, message: 'no data'})
        }

        const convertData = convert.xml2json(body, {compact: true, spaces: 2})
        const result = JSON.parse(convertData)
        let waiterList = {}
        result.RK7QueryResult.Waiters.waiter.forEach((item, index) => {
            waiterList = { ...waiterList, [index] : { ...item._attributes } } })
        res.send(waiterList)
    })
})

app.listen( 4000, () => {
    console.log('Server Start in 4000 port')
})