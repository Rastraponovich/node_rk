const express = require('express')
const cors = require('cors')
const fetch = require('node-fetch')
const { json, static } = require('express')
const config = require('./config')
const fs = require('fs')
const app = express()
const { ODocs, GAbcRpt, GRemns, GGroups, Divisions, Departs  } = require('./shproc')
const { getInfoDivision } = require('./nodeProc')
// const { GDocProtocol } = require('./GDocProtocol')
// const { EQuery } = require('./EQuery')


app.set("view engine", "hbs")

app.use(express.json())
app.use(cors())
app.use(express.static('style'))
app.use(express.urlencoded({ extended: false }))

const init = async () => {
    console.log(`Server Start in ${config.port} port`)
     
}




app.get('/', async(req, res) => {
    divisions = await Divisions()
    departs = await Departs()
    menuTree = await GGroups()
    // gDocProtocol = await GDocProtocol()
    // res.send(menuTree)
    // console.log(divisions, departs)
    res.render('index.hbs', { menuTree, departs, divisions })
})

app.post('/', async(req, res) => {
    const data = req.body

    devdep = await getInfoDivision(data.departs)
    divisions = await Divisions()
    departs = await Departs()
    menuTree = await GGroups()

    console.log(req.body)
    const report = await GAbcRpt(data)
    res.render('index.hbs', { menuTree, report, devdep })
})



app.get('/GAbcRpt', async(req, res) => {
    const x = await GAbcRpt()
    console.log(x)
    res.send(x)
})


//render остатков
app.get('/GRemns', async(req, res) => {
    const result = await GRemns()
    res.render('index.hbs', { result })
})

app.post('/GRemns', async(req, res) => {
    const x = await GRemns()
    res.send(x)
})


app.listen( config.port, () => {
    init()
})