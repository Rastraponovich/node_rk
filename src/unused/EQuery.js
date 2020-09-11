
const config = require('./config')
const fetch = require('node-fetch')
const fs = require('fs') 
const EQuery = async() => {
// const { start, end, type, MinActiveDate } = values
    const procName = 'EQuery'
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
                    { 
                        "head": "108", 
                        "original": [ "102\\1", "102\\114\\1", "102\\114\\34", "102\\114\\35\\Port", "102\\114\\35\\Host"], 
                        "values": [ [65534], [236645002], ["12"],  ["8080"], ["10.2.0.2"] ] },
                   
                ]
            }
        )
    })
    const result = await query.json()
    let queryResult = {}

    console.log(result.shTable[0].values)

    result.shTable.forEach(itemElement => {
        if(itemElement.head === '108') {
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
    console.log(queryResult)
}

// // Список Запросов 
// Object 108 {
//     // Юр.лицо
//     Object 102 {
//        // Юр.лицо:Rid
//        tUint32 1 tsKey
//        Object 114 {
//           // Коды спецификаций контрагента:Rid 
//           tUint32 1 tsKey
//        }
//     }
//  }
//  Out parameters
//  Object 108 {
//     // Юр.лицо
//     Object 102 {
//        Object 114 {
//           // Коды спецификаций контрагента:ExtCode,ExtAttrs1
//           tStrP 34[255]
//           tBob 35[type:Attrs]
//        }
//     }
//  }
//  Array 247 {
//     // Запрос: QueryType
//     tUint32 11
//     // Запрос: URL,Params,DateTime
//     tStrP 10[255]
//     tStrP 12[255]
//     tStrP 13[255]
//  }

module.exports = {
    EQuery
}