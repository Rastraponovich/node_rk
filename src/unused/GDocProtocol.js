
const config = require('./config')
const fetch = require('node-fetch')
const fs = require('fs')

// Протокол накладных
const GDocProtocol = async(values) => {
    // const { start, end, type, MinActiveDate } = values
    const procName = 'GDocProtocol'

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
                    { "head": "108", "original": [ "1", "2"], "values": [ ["2020-06-01"], ['2020-08-20']] },
                    // { "head": "111", "original": [ "47" ], "values": [[]] }
                ]
            }
        )
    })
    const result = await query.json()
    let queryResult = {}

    console.log(result)

    result.shTable.forEach(itemElement => {
        if(itemElement.head === '111') {
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


}
// Object 108 {
//     // Накладные - фильтр: DateFrom, DateTo, Type (0-CUD, 1-C, 2-D), MinActiveDate
//     tShortDate 1
//     tShortDate 2
//     tUint16 7
//     Object 111 {
//        tShortDate 47
//     }
//  }
//  Out parameters
//  Array 111 {
//     // Накладная: Rid, Guid, Type, Options, Name, Date
//     tUint32 1 tsKey
//     tBinary 4[16]
//     tUint16 5
//     tUint16 33
//     tStrP 3[255]
//     tShortDate 31
//     // История накладной: MinActiveDate
//     tShortDate 47
//     // История накладной: creator
//     Object 109 {
//        // Пользователь: Имя, id, date, time
//        tStrP 3[255]
//        tUint32 1
//        tShortDate 7
//        tUint32 8
//     }
//     // История накладной: updater
//     Object 109#1 {
//        // Пользователь: Имя, id, date, time
//        tStrP 3[255]
//        tUint32 1
//        tShortDate 7
//        tUint32 8
//     }
//     // История накладной: deleter
//     Object 109#2 {
//        // Пользователь: Имя, id, date, time
//        tStrP 3[255]
//        tUint32 1
//        tShortDate 7
//        tUint32 8
//     }
//  }
 

 module.exports = {
    GDocProtocol
 }