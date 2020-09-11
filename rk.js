const express = require('express')
const cors = require('cors')
const { json, static } = require('express')
const fs = require('fs')
const multer = require('multer')
const expressHbs = require("express-handlebars")
const hbs = require("hbs")
const { saveItem, getFolderList, getDishList, convertXML, readXLS } = require('./src/models/methods')
const config = require('./config')

const app = express()

app.use(express.json())
app.use(cors())
app.use(express.urlencoded({ extended: false }))

const storageConfig = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
            cb(null, "uploads/image/")
        } else {
            cb(null, "uploads")
        }
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
})

const upload = multer({ storage: storageConfig })

app.use(express.static(__dirname + '/public'))
app.use(express.static(__dirname + '/uploads'))


app.engine("hbs", expressHbs(
    {
        layoutsDir: "./views/layouts", 
        defaultLayout: "layout",
        extname: "hbs"
    }
))
app.set("view engine", "hbs")
hbs.registerPartials(__dirname + "./views/partials")

app.get('/', async(req, res) => {
   
    res.render("home.hbs")
})
app.get('/getItems', async(req, res) => {
    getDishList()
    const readItems = fs.readFileSync('./data/dishList.json', 'utf-8')
    const folderList = JSON.parse(readItems)
    res.render("home.hbs", {folderList})
})
app.get('/getFolders', async(req, res) => {
    getFolderList()
    const readFolder = fs.readFileSync('./data/folders.json', 'utf-8')
    const folderList = JSON.parse(readFolder)
    res.render("home.hbs", {folderList})
})

app.get('/readFolder', async(req, res) => {
    const file = fs.existsSync('./uploads/kitchen.xlsx')
   
    if(file) {
        const resultFolder = readXLS('./uploads/kitchen.xlsx', 'folders')
        res.render("home.hbs", {resultFolder})
    } else {
        res.render("home.hbs", { message: 'no file' })
    }
})

app.get('/saveFolder', async(req, res) => {
    const file = fs.existsSync('./data/prepareFolders.json')
   
    if(file) {
        convertXML('./data/prepareFolders.json', 'folder')
        res.render('home.hbs')
    } else {
        res.render("home.hbs", { message: 'no file' })
    }
})

app.get('/readDish', async(req, res) => {
    const file = fs.existsSync('./uploads/kitchen.xlsx')

    if(file) {
        const resultFile = readXLS('./uploads/kitchen.xlsx', 'dishes')
        res.render("home.hbs", {resultFile})
    } else {
        res.render("home.hbs", { message: 'no file' })
    }
})

app.get('/saveDish', async(req, res) => {
    const file = fs.existsSync('./data/prepareItems.json')

    if(file) {
        convertXML('./data/prepareItems.json', 'dish')
        res.render('home.hbs')
    } else {
        res.render('home.hbs', {message: 'no file'})
    }
})

app.get('/settings', async(req, res) => {
    const settings = config
    res.render('settings.hbs', {settings})
})

app.post('/settings', async(req, res) => {
    console.log(req.body)
    
    const settings = {
        ...req.body
    }


    res.render('settings.hbs', {settings})
})

app.post('/', upload.array('filedata'), async (req, res, next) => {
    let filedata = req.files
    // console.log(filedata)

    let files = []
    req.files.forEach(item => {
        if (item.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            files.push(item)
            readXLS(item.path)
        }
    })

    if (!filedata || filedata.length <= 0) {
        res.render('home.hbs', { message: 'error' })
    } else {
        res.render('home.hbs', { message: 'success', files: files })
    }
})

const init = async () => {
    console.log('Server Start in 4000 port')
}

app.listen( 4000, () => {
    init()
})