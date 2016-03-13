var express = require('express');
var bodyParser = require('body-parser');

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
	var matchedTODO;
	//iterate over todos array for a match
	todos.forEach(function(item) {
		if (item.id === todoID) {
			matchedTODO = item;
		}
	});
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
	var body = req.body;
	
	
	var todoItem = body;
	todoItem["id"] = todoNextId++;
	todos.push(todoItem);
	res.json(todoItem);
});

app.listen(PORT, function() {
	console.log('Express listening on port: ' + PORT + '!');
})