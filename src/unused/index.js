const express = require('express')
const cors = require('cors')
const convert = require('xml-js')
const request = require('request')
const { json } = require('express')
const { uuid } = require('uuidv4')
// const URL = 'https://10.2.0.2:86/rk7api/v0/xmlinterface.xml'
const URL = 'https://10.20.16.2:86/rk7api/v0/xmlinterface.xml'

const USERNAME = 'Wilde'
const PASSWORD = '1024'
const app = express()

app.use(express.json())
app.use(cors())
app.use(express.urlencoded({ extended: false }))

let RefWaiterList = {}
let MidWaiter = {}


const getRefData = (refName) => {
    request.post(URL, {
        method: "POST",
        auth: { user: USERNAME, password: PASSWORD },
        rejectUnauthorized: false,
        agent: false,
        secureProtocol: 'TLSv1_method',
        headers: {
            "Content-Type" : "text/xml",
            // 'Authorization': 'Basic ' + login
        },
    
        body: `<?xml version="1.0" encoding="windows-1251"?>
                    <RK7Query>
                        <RK7Command CMD="GetRefData" RefName="${refName}">
                        </RK7Command>
                    </RK7Query>` 

    }, (err, response, body) => {
        if (err) {
            console.log(err)
        }

        const convertData = convert.xml2json(body, {compact: true, spaces: 2})
        const result = JSON.parse(convertData)
        const resultItems = result.RK7QueryResult.CommandResult.RK7Reference.Items
        // console.log(resultItems)
        resultItems.Item.forEach(item => {
            if(item._attributes.Name === 'Нераспределяемые Наценки') {
                out = item
            }
        })
        // console.dir()
    })
}

const SetRefData = async(refName) => {
    let guid = uuid()
    console.log(guid)
    request.post(URL, {
        method: "POST",
        auth: { user: USERNAME, password: PASSWORD },
        rejectUnauthorized: false,
        agent: false,
        secureProtocol: 'TLSv1_method',
        headers: {
            "Content-Type" : "text/xml",
            // 'Authorization': 'Basic ' + login
        },
    
        body: `<?xml version="1.0" encoding="windows-1251"?>
                    <RK7Query>
                        <RK7Command CMD="SetRefData" RefName="${refName}">
                            <Items>
                                <Item GUIDString="{${guid}}" Name="тесты" AltName="" Status="rsActive" />
                            </Items>
                        </RK7Command>
                    </RK7Query>` 

    }, (err, response, body) => {
        if (err) {
            console.log(err)
            return
        }

        const convertData = convert.xml2json(body, {compact: true, spaces: 2})
        const result = JSON.parse(convertData)
        console.dir(result)
    })
}

const getMidWaiters = async(login) => {
    request.post(URL, {
        method: "POST",
        auth: { user: USERNAME, password: PASSWORD },
        rejectUnauthorized: false,
        agent: false,
        secureProtocol: 'TLSv1_method',
        headers:{
            "Content-Type" : "text/xml",
        },
        body: `<?xml version="1.0" encoding="windows-1251"?>
                    <RK7Query>
                        <RK7CMD CMD="GetWaiterList" registeredOnly="1"/>
                    </RK7Query>` 

    }, (err, response, body) => {
        if (err) { 
            console.log(err)
            return
        }

        const convertData = convert.xml2json(body, {compact: true, spaces: 2})
        const result = JSON.parse(convertData)
        if( Array.isArray(result.RK7QueryResult.Waiters.waiter) === true ) {
            result.RK7QueryResult.Waiters.waiter.forEach((item, index) => {
                MidWaiter = { ...MidWaiter, [index] : { ...item._attributes } } })
            return
        } else {
            const { _attributes } = result.RK7QueryResult.Waiters.waiter
            MidWaiter = { _attributes, single: true }
            return
        }
    })
}
const test = async(value) => {
    if (value.length > 0) {
        return { error: false }
    } else {
        return { error: true }
    }
}

const sendMesage = async(data) => {
    if (data) {
        request.post(URL, {
            method: "POST",
            auth: { user: USERNAME, password: PASSWORD },
            rejectUnauthorized: false,
            agent: false,
            secureProtocol: 'TLSv1_method',
            headers:{
                "Content-Type" : "text/xml",
            },
            body: `<?xml version="1.0" encoding="windows-1251"?>
                        <RK7Query>
                            <RK7CMD CMD="WaiterMessage" messageType="FromTable" expireTime="00:10:10" text="${data.message}"> 
                                <Buttons> 
                                    <Button text="Текст кнопки">
                                        <Image />
                                    </Button>
                                </Buttons>
                                <Waiter code="${data.Code}"/>
                            </RK7CMD>
                        </RK7Query>` 
    
        }, async(err, res, body) => {
            if(err) {
                console.log(err)
                return
            }
            const result = await test(body)
            if(result) {
                return
            }
        })
        return { error: false }
    } else {
        return { error: true }
    }
}

app.get('/getWaiters', async (req, res) => {
    let result 
    await getMidWaiters('V2lsZGU6MTAyNA==')

    for(let key in RefWaiterList) {
        if(MidWaiter._attributes.Code === key) {
            result = {
                ...result,
                [key]: { Name: RefWaiterList[key].Name, Code: RefWaiterList[key].Code, ID: RefWaiterList[key].ID }
            }
        }
    }
    res.send(result)
})

app.post('/sendMessage', async(req, res) => {
    let itemKey 
    for (let key in RefWaiterList) {
        if (RefWaiterList[key].ID === req.body.personal) {
            itemKey = key
        }
    }
    const result = await sendMesage({ message: req.body.message, ...RefWaiterList[itemKey] })
    res.send({ error: result, message: RefWaiterList[itemKey].Name, ...result })
})

const init = async () => {
    // await getRefWaiters('V2lsZGU6MTAyNA==')
    // await getMidWaiters('V2lsZGU6MTAyNA==')
    getRefData('CATEGLIST')

    console.log('Server Start in 4000 port')
    setTimeout(() => console.log(out), 5000 )
}

app.listen( 4000, () => {
    init()
})