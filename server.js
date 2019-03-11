// load the things we need
var express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');

if (typeof fetch !== 'function') {
	global.fetch = require('node-fetch-polyfill');
}
const csv = require('d3-fetch').csv;

var d3 = require("d3");

// create connection to database
// the mysql.createConnection function takes in a configuration object which contains host, user, password and the database name.
const db = mysql.createConnection ({
	host: 'localhost',
    user: 'root',
    password: '',
    database: 'master_thesis'
});

// connect to database
db.connect((err) => {
    if (err) {
		throw err;
    }
    console.log('Connected to database');
});
//global.db = db;

var app = express();
app.use(bodyParser.json());

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
app.get('/second', function(req, res) {
	res.render('pages/second');
});

app.get('/annotations', function(req, res) {	
	var query = "SELECT * FROM annotations ";
	var extra = [];
	if ("dataset" in req.query) {
		query += " WHERE dataset = ?";
		extra.push(req.query.dataset);
	}

	db.query(
		query, 
		extra,
		function (error, result) {
			if (error) {
				console.log(error)
				res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
			} else {
				res.send(JSON.stringify({"annotations": result}));
			}
		}
	);
});

app.get('/annotations/:id', function(req, res) {	
	db.query(
		"SELECT * FROM annotations WHERE id = ?",
		[
			req.params.id,     
		],
		function(error, result) { 
			if (error) {
				console.log(error)
				res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
			} else {
				if (!(result.length > 0)) {
					res.send(JSON.stringify({"status": 404, "error": "Annotation not found", "response": null}));
				} else {
					res.send(JSON.stringify({"annotation": result}));
				}
			}
		}
	);
});

app.post('/annotations', function(req, res) {
	console.log(req.body)
	if (!("dataset" in req.body)
		|| !("type" in req.body)
		|| !("comment" in req.body)
		|| !("creationDate" in req.body)
		|| !("systemName" in req.body)
	) {		
		res.status(400).send("Missing parameter");
	} else {
		db.query(
			"INSERT INTO annotations (dataset, type, comment, creationDate, systemName) VALUES (?,?,?,?,?)",
			[
				req.body.dataset,
				req.body.type, 
				req.body.comment, 
				req.body.creationDate, 
				req.body.systemName
			],
			function(error, result) { 
				if (error) {
					res.status(500).send(JSON.stringify({"status": 500, "error": error, "response": null}));
				} else {
					req.body.id = result.insertId;
					res.status(201).send(JSON.stringify({"status": 201, "error": null, "annotation": req.body}));
				}
			}
		);
	}
});

app.delete('/annotations/:id', function(req, res) {
	db.query(
		"DELETE FROM annotations WHERE id = ?",
		[
			req.params.id
		],
		function(error, result) { 
			if (error) {
				console.log(error)
				res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
			} else {				
					res.status(204).send();
			}
		}
	);
});

app.listen(3000);
console.log('3000 is the magic port');


