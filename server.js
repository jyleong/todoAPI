var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;
// a unique identified like in databases,a description, a completed boolean, a time?
var todos = [{
	id: 1,
	description: "pick up the car",
	completed: false

}, {
	id: 2,
	description: 'make lunch',
	completed: false
}, {
	id: 3,
	description: 'do some udemy',
	completed: false
}
];

app.get('/',function(req,res) {
	res.send('TODO api root');
});

// GET /todos
app.get('/todos', function(req,res) {
	res.json(todos);
});
// GET /todos/:id GET/todos/1

app.listen(PORT, function() {
	console.log('Express listening on port: ' + PORT + '!');
})