// load the things we need
var express = require('express');
const bodyParser = require('body-parser');

if (typeof fetch !== 'function') {
	global.fetch = require('node-fetch-polyfill');
}

var app = express();
app.use(bodyParser.json());

// set the view engine to ejs
app.set('view engine', 'ejs');

app.use(express.static('public'))

const database = require('./data/annotations');
const data = require('./data/processing');

// index page
app.get('/', function(req, res) {		
		res.render('pages/index');
});

app.get('/statistics', function(req, res) {
	res.render('pages/statistics');
});

app.get('/full-calendar', function(req, res) {
	res.render('pages/full-calendar');
});

app.get('/datasets/:name', function(req, res) {	
	var rawData = data.getRawData(req.params.name);
	var annotations = database.getAnnotations(req.params.name);
	
	annotations.then(function(result) {
		res.send(JSON.stringify({
			annotations: result,
			data: rawData
		}));
	});	
});

app.get('/full-calendar', function(req, res) {
	res.render('pages/full-calendar');
});

app.get('/annotations', function(req, res) {	
	var dataset;
	if ("dataset" in req.query) {
		dataset = req.query.dataset;
	}
	var data = database.getAnnotations(dataset);
	
	data.then(function(result) {
		if (result === "") {
			res.send(JSON.stringify({"status": 500, "error": "Unknown Error", "response": null}));
		} else {
			res.send(JSON.stringify({"annotations": result}));
		}
	})
});

app.get('/annotations/:id', function(req, res) {
	var data = database.getAnnotation(req.params.id);
	data.then(function(result) {
		if (!(result.length > 0)) {
			res.send(JSON.stringify({"status": 404, "error": "Annotation not found", "response": null}));
		} else {
			res.send(JSON.stringify({"annotation": result}));
		}
	});
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
		var body = [
			req.body.dataset,
			req.body.type, 
			req.body.comment, 
			new Date(),
			req.body.systemName
		];
		var data = database.addAnnotation(body);
		data.then(function(result) {			
			if (isNaN(result)) {
				res.status(500).send(JSON.stringify({"status": 500, "error": result, "response": null}));
			} else {
				req.body.id = result;
				res.status(201).send(JSON.stringify({"status": 201, "error": null, "annotation": req.body}));
			}
		});
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


