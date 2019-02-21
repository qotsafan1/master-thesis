// load the things we need
var express = require('express');

if (typeof fetch !== 'function') {
    global.fetch = require('node-fetch-polyfill');
}
const csv = require('d3-fetch').csv;

var d3 = require("d3");

var app = express();

// set the view engine to ejs
app.set('view engine', 'ejs');

app.use(express.static('public'))

// use res.render to load up an ejs view file

// index page
app.get('/', function(req, res) {
	res.render('pages/index');
});

// about page
app.get('/first', function(req, res) {
	res.render('pages/first');
});

app.listen(3000);
console.log('3000 is the magic port');
