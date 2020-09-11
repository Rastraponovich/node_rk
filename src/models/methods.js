const request = require('request')
const convert = require('xml-js')
const { uuid } = require('uuidv4')
const XLSX = require('convert-excel-to-json')
const fs = require('fs')
const config = require('../../config')

let folderList = {}
let dishList = {}
let directoryList = {}
//получить все папки
const getFolderList = async() => {
    const refName = "CATEGLIST"
    request.post(config.URL, {
        method: "POST",
        auth: { user: config.user, password: config.pass },
        rejectUnauthorized: false,
        agent: false,
        secureProtocol: 'TLSv1_method',
        headers: {
            "Content-Type" : "text/xml",
        },
    
        body: `<?xml version="1.0" encoding="windows-1251"?>
                    <RK7Query>
                        <RK7Command CMD="GetRefData" RefName="${refName}">
                        </RK7Command>
                    </RK7Query>` 

    }, async (err, response, body) => {
        if (err) {
            console.log(err)
        }

        const convertData = convert.xml2json(body, {compact: true, spaces: 2})
        const result = JSON.parse(convertData)
        const resultItems = result.RK7QueryResult.CommandResult.RK7Reference.Items
        resultItems.Item.forEach(item => {
            folderList = {
                ...folderList,
                [item._attributes.Name]: {
                    attributes: item._attributes,
                    childs: {
                        attributes: item.Childs._attributes,
                        child: item.Childs.Child
                    }
                }
            }
        })
        fs.writeFileSync('./data/folders.json', JSON.stringify(folderList, null, '\t'))
    })
}
//получить все блюда
const getDishList = () => {
    const refName = "MENUITEMS"
    request.post(config.URL, {
        method: "POST",
        auth: { user: config.user, password: config.pass },
        rejectUnauthorized: false,
        agent: false,
        secureProtocol: 'TLSv1_method',
        headers: {
            "Content-Type" : "text/xml",
        },
    
        body: `<?xml version="1.0" encoding="windows-1251"?>
                    <RK7Query>
                        <RK7Command CMD="GetRefData" RefName="${refName}">
                        </RK7Command>
                    </RK7Query>` 

    }, async (err, response, body) => {
        if (err) {
            console.log(err)
        }

        const convertData = convert.xml2json(body, {compact: true, spaces: 2})
        const result = JSON.parse(convertData)
        const resultItems = result.RK7QueryResult.CommandResult.RK7Reference.Items
        // console.dir(resultItems, {depth: 3})
        resultItems.Item.forEach(item => {
            if(item._attributes.Name !== ''){
                dishList = {
                    ...dishList,
                    [item._attributes.Name]: {
                        attributes: item._attributes,
                        recommendedMenuItems: item.RecommendedMenuItems,
                        childs: {
                            attributes: item.Childs._attributes,
                        }
                    }
                }}
        })
        console.log(dishList)
        fs.writeFileSync('./data/dishList.json', JSON.stringify(dishList, null, '\t'))
    })
}


//Создать или модифицировать папку или блюдо
const saveItem = async(refName, value) => {
    let guid = uuid()

    request.post(config.URL, {
        method: "POST",
        auth: { user: config.user, password: config.pass },
        rejectUnauthorized: false,
        agent: false,
        secureProtocol: 'TLSv1_method',
        headers: {
            "Content-Type" : "text/xml",
        },
    
        body: `<?xml version="1.0" encoding="windows-1251"?>
                    <RK7Query>
                        <RK7Command CMD="SetRefData" RefName="${refName}">
                            <Items>
                                ${value}
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
//делаем xml из парсинга данных xlsx

const convertXML = (file, type) => {
    
    //<Item GUIDString="{${guid}}" Name="тесты" AltName="" Status="rsActive" />
    // let folder = `<Item GUIDString="{${item.guid}}" Name="${item.name}" AltName="" Status="rsActive" MainParentIdent="{A6936623-04DD-4268-95EF-9338E7FC232A}" />`
    // let dish = `<Item GUIDString="{${item.guid}}" MainParentIdent="{${item.parentGUID}}" Name="${item.name}" AltName="" Status="rsActive" TaxDishType="3"  PRICETYPES-0="${item.price}" CLASSIFICATORGROUPS-2560="${item.classification}" CLASSIFICATORGROUPS-512="${item.print}"/>`
    let resultFile = []
    let jsonFile = fs.readFileSync(file , 'utf-8')
    const result = JSON.parse(jsonFile)
    console.log(result)
    for (let [key, item] of Object.entries(result)) {
        if (type === 'folder') {
            saveItem('CATEGLIST', `<Item GUIDString="{${item.guid}}" Name="${item.folder}" AltName="" Status="rsActive" MainParentIdent="{${item.parentGUID}}" />`)
            
        }
        if (type === 'dish') {
            saveItem('MenuItems',`<Item GUIDString="{${item.guid}}" Flags="[miUseRestControl]" MainParentIdent="{${item.parentGUID}}" Name="${item.name}" AltName="" Status="rsActive" TaxDishType="3" QntDecDigits="3"  PRICETYPES-3="${item.price}" CLASSIFICATORGROUPS-2560="${item.classification}" CLASSIFICATORGROUPS-512="${item.print}"/>` )
        }
        // resultFile.push(`<Item GUIDString="{${item.guid}}" MainParentIdent="{${item.parentGUID}}" Name="${item.name}" AltName="" Status="rsActive" TaxDishType="3"  PRICETYPES-3="${item.price}" CLASSIFICATORGROUPS-2560="${item.classification}" CLASSIFICATORGROUPS-512="${item.print}"/>`)
    }
    fs.writeFileSync(`./data/${type}.xml`, resultFile)
}



//читаем файл
const readXLS = (file, type) => {
    console.log(file, type)
    const result = XLSX({
        sourceFile: file,
        header:{
            // Is the number of rows that will be skipped and will not be present at our result object. Counting from top to bottom
            rows: 1 // 2, 3, 4, etc.
        },
        columnToKey: {
            A: 'folder',
            B: 'name',
            C: 'price',
            D: 'parentGUID',
            E: 'classification',
            F: 'print'
        }
    })

    if (type === 'folders') {
        directoryList = {}
        result['Лист2'].forEach((item, idx) => {
            if (item.folder && item.parentGUID && !item.name) {
                directoryList = {
                    ...directoryList,
                    [idx] : {
                        ...item, guid: uuid().toUpperCase()
                    }
                }
                fs.writeFileSync('./data/prepareFolders.json', JSON.stringify(directoryList, null, '  '))
            }
        })
    } 

    if (type === 'dishes') {
        directoryList = {}
        console.log(1)
        result['Лист2'].forEach((item, idx) => {
            if (!item.folder && item.name && item.parentGUID) {
                directoryList = {
                    ...directoryList,
                    [idx]: {
                        ...item, guid: uuid().toUpperCase(), price: item.price*100
                    }
                }
                fs.writeFileSync('./data/prepareItems.json', JSON.stringify(directoryList, null, '  '))
            }
        })
        // return
    }
    console.log(directoryList)
    return directoryList
}


module.exports = {
    getFolderList,
    getDishList,
    saveItem,
    convertXML,
    readXLS
}