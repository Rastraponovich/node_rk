const fs = require('fs')






const getInfoDivision = async(value) => {
    let result = {}
    const x = fs.readFileSync('./data/Departs.json', 'UTF-8')
    const departsData = await JSON.parse(x)
    
    for (let key in departsData) {
        if (parseInt(value) === departsData[key].Rid) {
            result = {
                depart: departsData[key].Name,
                division: departsData[key]["venture Name"]
            }
        }
    }
    return result
}


module.exports = {
    getInfoDivision
}



