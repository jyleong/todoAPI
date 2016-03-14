var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var app = express();
var PORT = process.env.PORT || 3000;
// a unique identified like in databases,a description, a completed boolean, a time?
var todos = [];
var todoNextId = 1; // to increment todo id as they get new id

app.use(bodyParser.json());
app.get('/',function(req,res) {
	res.send('TODO api root');
});

// GET /todos
app.get('/todos', function(req,res) {
	res.json(todos);
});
// GET /todos/:id GET/todos/1
app.get('/todos/:id', function(req,res) {
	var todoID = parseInt(req.params.id,10);
	var matchedTODO = _.findWhere(todos, {id: todoID});
	if (matchedTODO) {
		res.json(matchedTODO);
	}
	else {
		res.status(404).send();
	}
})

// POST, can take data
// POST /todos/:id <- id generated after todo is created
app.post('/todos', function(req, res) {
	var body = _.pick(req.body,'description','completed');
	
	if(!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0){
		return res.status(400).send();
	}
	//set body.description to be trimed value
	body.id = todoNextId++;
	body.description = body.description.trim();

	todos.push(body);
	res.json(body);
});

// DELETE /todos/:id

app.delete('/todos/:id', function(req, res) {
	var todoID = parseInt(req.params.id,10);
	var matchedTODO = _.findWhere(todos, {id: todoID});
	todos = _.without(todos, {id: todoID});
	if (matchedTODO) {
		todos = _.without(todos,matchedTODO);
		res.json(matchedTODO);
	}
	else {
		res.status(404).json({"error": "no todo found with that id"});
	}
	//returm the thing deleted
});

// PUT /todos/:id
app.put('/todos/:id', function(req, res) {
	var todoID = parseInt(req.params.id,10);
	var matchedTODO = _.findWhere(todos, {id: todoID});
	var body = _.pick(req.body,'description','completed');
	var validAttribute = {};
	if(!matchedTODO) {
		return res.status(404).json({"error": "no todo found with that id"});
	}
	//body.hasOwnProperty('completed')
	if(body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
		validAttribute.completed = body.completed;
	}
	else if(body.hasOwnProperty('completed')) {
		console.log('bool');
		return res.status(400).send();
	}
	
	if(body.hasOwnProperty('description') && _.isString(body.description)&& body.description.trim().length > 0) {
		validAttribute.description = body.description;
	}
	else if(body.hasOwnProperty('description')) {
		console.log('description');
		return res.status(400).send();
	}
	// HERE, and note objects are pass by referene
	_.extend(matchedTODO, validAttribute);
	res.json(matchedTODO);
});

app.listen(PORT, function() {
	console.log('Express listening on port: ' + PORT + '!');
})