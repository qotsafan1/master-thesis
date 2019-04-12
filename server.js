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

app.get('/monthly-breakdown', function(req, res) {
	res.render('pages/monthly-breakdown');
});

app.get('/datasets/:name', function(req, res) {	
	var rawData = data.getRawData(req.params.name);
	//console.log(rawData)
	var annotations = database.getAnnotations(req.params.name);
	
	annotations.then(function(result) {
		var observations = database.getObservations(req.params.name);
		observations.then(function(obResults) {
			res.send(JSON.stringify({
				annotations: result,
				observations: obResults,
				data: rawData
			}));
		});
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
	var data = database.deleteAnnotation(req.params.id);
	data.then(function(result) {
		if (result.length > 0) {
			res.send(JSON.stringify({"status": 500, "error": "Unable to delete annotation", "response": null}));
		} else {
			res.status(204).send();
		}
	});
});

app.post('/observations', function(req, res) {
	console.log(req.body)
	if (!("dataset" in req.body)
		|| !("type" in req.body)
		|| !("comment" in req.body)
		|| !("creationDate" in req.body)
		|| !("systemName" in req.body)
	) {		
		res.status(400).send("Missing parameter");
	} else {
		var observationBody = [
			req.body.dataset,
			req.body.type,
			req.body.comment, 
			new Date(),
			req.body.systemName
		];

		var data = database.invalidateObservation(observationBody);
		data.then(function(result) {			
			if (isNaN(result)) {
				res.status(500).send(JSON.stringify({"status": 500, "error": result, "response": null}));
			} else {
				req.body.id = result;
				res.status(201).send(JSON.stringify({"status": 201, "error": null, "invalidatedObservation": req.body}));
			}
		});		
	}
});

app.delete('/observations/:systemName', function(req, res) {
	var data = database.deleteObservation(req.params.systemName);
	data.then(function(result) {		
		if (result.length > 0) {
			res.send(JSON.stringify({"status": 500, "error": "Unable to delete observation", "response": null}));
		} else {
			res.status(204).send();
		}
	})
	.catch(function(err) {
		console.log(err)
	});
});

app.listen(3000);
console.log('3000 is the magic port');
