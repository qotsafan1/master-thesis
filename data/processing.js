var d3 = require("d3");
const fs = require('fs')

exports.getRawData = function(dataset) {
    var raw = fs.readFileSync('public/data/' + dataset, 'utf8')
    var allData = [];

    d3.csvParseRows(raw).map(function(row) {  
        if (row.length > 1) {
            allData.push({
                date: row[0],
                timezone: row[1]
            });
        } else {
            allData.push({
                date: row[0]
            });
        }
    });
    //console.log(d3.csvParse(raw));
    return allData;
}

