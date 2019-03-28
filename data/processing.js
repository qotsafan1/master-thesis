var d3 = require("d3");
const fs = require('fs')

exports.getRawData = function(dataset) {
    var raw = fs.readFileSync('public/data/' + dataset, 'utf8')
    return d3.csvParse(raw);
}

