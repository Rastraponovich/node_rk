const config = require('./config')
const fetch = require('node-fetch')
const fs = require('fs')

// заявки
const ODocs = async() => {
    procName = 'ODocs'
    const query = await fetch(`${config.address}/api/sh5exec`, {
        method: "POST",
        headers:{
            "Content-Type" : "application/json"
        },
        body: JSON.stringify(
            { 
                "UserName": config.userName, 
                "Password": config.pasword, 
                "procName": procName,
                "Input": [
                    { "head": "108", "original": [ "1", "2" ], "values": [ ["2018-09-24"], ["2018-09-25"] ] },
                    { "head": "106#10", "original": [ "1" ], "values": [[20971524]] }
                ]
            }
        )
    })
    const result = await query.json()
    console.log(result)
}
//остатки блюд
const GRemns = async() => {
    procName = 'GRemns'
    const query = await fetch(`${config.address}/api/sh5exec`, {
        method: "POST",
        headers:{
            "Content-Type" : "application/json"
        },
        body: JSON.stringify(
            { 
                "UserName": config.userName, 
                "Password": config.pasword, 
                "procName": procName,
                "Input": [
                    { "head": "108", "original": [ "1", "8" ], "values": [ ["2020-08-19"], [ "1" ] ] },
                    { "head": "106#10", "original": [ "1" ], "values": [[50331649]] }
                ]
            }
        )
    })
    const result = await query.json()
    let queryResult = {}

    result.shTable.forEach(item => {
        let countItems
        if(item.head === '151'){
            // console.log(item)
            countItems = item.values[6].length
            for (let i = 0; i < countItems; i++) {
                queryResult = {
                    ...queryResult,
                    [i] : {
                        name: item.values[6][i],
                        quantity: item.values[0][i],
                        in: item.values[10][i],
                        summ: item.values[1][i],
                        rid : item.values[5][i]
                    }
                }
            }
            
        }
    })
    return queryResult
}

//Товарные группы
const GGroups = async() => {
    procName = 'GGroupsTree'
    const query = await fetch(`${config.address}/api/sh5exec`, {
        method: "POST",
        headers:{
            "Content-Type" : "application/json"
        },
        body: JSON.stringify(
            { 
                "UserName": config.userName, 
                "Password": config.pasword, 
                "procName": procName,
            }
        )
    })

    const result = await query.json()
    
    let queryResult = {}
    let somresult = {}
    result.shTable.forEach(item => {
        let countItems
        if(item.head === '209'){
            countItems = item.values[0].length
            for (let i = 0; i < countItems; i++) {
                //item.values[0][i] !== undefined 
                if (item.values[3][i] === 1)
                {
                    queryResult = {
                        ...queryResult,
                        [i] : {
                            rid: item.values[0][i],
                            guid: item.values[1][i],
                            name: item.values[2][i],
                            parentRid: item.values[3][i],
                            parentGuid: item.values[4][i],
                            parentName: item.values[5][i],
                        }
                    }
                }
            }
            
            // for(let [key, item] of Object.entries(queryResult)) {
            //     for (let i = 0; i < countItems; i++) {
                    
            //         if(item.rid === queryResult[i].parentRid){
            //             somresult = {
            //                 ...somresult,
            //                 [item.name]: {
            //                     ...item,
            //                     ...somresult[item.name],
            //                     [queryResult[i].name]: {
            //                         ...somresult[[queryResult[i].name][item.name]],
            //                         ...queryResult[i],
            //                     }
                                
            //                 }
        
            //             }
            //         }
            // }
            // // console.log(somresult)
            // }
        }
    })
    return queryResult
}
//предприятия
const Divisions = async(value) => {
    procName = 'Divisions'
    const query = await fetch(`${config.address}/api/sh5exec`, {
        method: "POST",
        headers:{
            "Content-Type" : "application/json"
        },
        body: JSON.stringify(
            { 
                "UserName": config.userName, 
                "Password": config.pasword, 
                "procName": procName,
            }
        )
    })
    const result = await query.json()
    let queryResult = {}

    result.shTable.forEach(itemElement => {
        if(itemElement.head === '103') {
            const itemCount = itemElement.values[0].length

            for (let i = 0; i < itemCount; i++) {
                for(let b = 0; b < itemElement.fields.length; b++) {
                    queryResult = {
                        ...queryResult,
                        [i] : {
                            ...queryResult[i],
                            [itemElement.fields[b]] : itemElement.values[b][i]
                        },
                    }
                }
            }
        }
    })
    fs.writeFile('./data/Divisions.json', JSON.stringify(queryResult, null, '\t'), (err) => {
        if (err) {
            console.log(err)
        }
    })

    return queryResult
}
//подразделения
const Departs = async() => {
    procName = 'Departs'
    const query = await fetch(`${config.address}/api/sh5exec`, {
        method: "POST",
        headers:{
            "Content-Type" : "application/json"
        },
        body: JSON.stringify(
            { 
                "UserName": config.userName, 
                "Password": config.pasword, 
                "procName": procName,
            }
        )
    })
    const result = await query.json()
    let queryResult = {}

    result.shTable.forEach(itemElement => {
        if(itemElement.head === '106') {
            const itemCount = itemElement.values[0].length

            for (let i = 0; i < itemCount; i++) {
                for(let b = 0; b < itemElement.fields.length; b++) {
                    queryResult = {
                        ...queryResult,
                        [i] : {
                            ...queryResult[i],
                            [itemElement.fields[b]] : itemElement.values[b][i]
                        },
                    }
                }
            }
        }
    })
    fs.writeFile('./data/Departs.json', JSON.stringify(queryResult, null, '\t'), (err) => {
        if (err) {
            console.log(err)
        }
    })
    return queryResult
}


//abc
const GAbcRpt = async(data) => {
    const { select, start, end, departs, divisions } = data
    procName = 'GAbcRpt'
    const query = await fetch(`${config.address}/api/sh5exec`, {
        method: "POST",
        headers:{
            "Content-Type" : "application/json"
        },
        body: JSON.stringify(
            { 
                "UserName": config.userName, 
                "Password": config.pasword, 
                "procName": procName,
                "Input": [
                    { "head": "108", "original": [ "1", "2", "209\\1"], "values": [ [start], [end], [select] ] },
                    { "head": "103#10", "original": [ "1" ], "values": [[parseInt(divisions)]] },
                    { "head": "106#10", "original": [ "1" ], "values": [[parseInt(departs)]] },
                    // { "head" : "209", "original": ["1"], "values": [ [value] ] }
                ]
            }
        )
    })
    const result = await query.json()
    let queryResult = {}
    
    result.shTable.forEach(item => {
        let countItems
        if(item.head === '163'){
            countItems = item.values[6].length
            for (let i = 0; i < countItems; i++) {
                for(let b = 0; b < item.fields.length; b++) {
                    queryResult = {
                        ...queryResult,
                        [i] : {
                            ...queryResult[i],
                            [item.fields[b]] : item.values[b][i]
                        },
                    }
                }
               
            }
            
        }
    })

    return { queryResult, data }
}

module.exports = {
    ODocs, GRemns, GGroups, Divisions, Departs, GAbcRpt
}

