var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var app = express();
var PORT = process.env.PORT || 3000;
// a unique identified like in databases,a description, a completed boolean, a time?
var bcrypt = require('bcrypt');
var middleware = require('./middleware')(db);

app.use(bodyParser.json());
app.get('/', function(req, res) {
	res.send('TODO api root');
});

// GET /todos?completed=true&q=house
app.get('/todos', middleware.requireAuthentication, function(req, res) {
	var query = req.query;
	var where = {
		userId: req.user.get('id')
	};
	if (query.hasOwnProperty('completed') && query.completed === 'true') {
		where.completed = true;
	} else if (query.hasOwnProperty('completed') && query.completed === 'false') {
		where.completed = false;
	}
	if (query.hasOwnProperty('q') && query.q.length > 0) {
		where.description = {
			$like: '%' + query.q + '%'
		}
	}
	db.todo.findAll({
		where: where
	}).then(function(todos) {
		res.json(todos);
	}, function(e) {
		res.status(500).send();
	});

});
// GET /todos/:id GET/todos/1
app.get('/todos/:id', middleware.requireAuthentication, function(req, res) {
	var todoID = parseInt(req.params.id, 10);
	var where = {
		userId: req.user.get('id'),
		id: todoID
	};
	db.todo.findOne(where).then(function(todoItem) {
		if (todoItem) {
			res.json(todoItem.toJSON());
		} else {
			res.status(404).send();
		}
	}).catch(function(e) {
		return res.status(500).send();
	})
});

// POST, can take data
// POST /todos/:id <- id generated after todo is created
app.post('/todos', middleware.requireAuthentication, function(req, res) {
	var body = _.pick(req.body, 'description', 'completed');

	//req.user is accessbilel because of middleware
	db.todo.create(body).then(function(todo) {
		req.user.addTodo(todo).then(function() {
			return todo.reload();
		}).then(function(todo) {
			res.json(todo.toJSON());
		});
	}).catch(function(e) {
		return res.status(400).json(e);
	})
});

// POST /users/:id <- id generated after todo is created
app.post('/users', function(req, res) {
	var body = _.pick(req.body, 'email', 'password');

	db.user.create({
		email: body.email,
		password: body.password
	}).then(function(user) {
		return res.status(200).json(user.toPublicJSON());
	}).catch(function(e) {
		return res.status(400).json(e);
	})
});


// DELETE /todos/:id

app.delete('/todos/:id', middleware.requireAuthentication, function(req, res) {
	var todoID = parseInt(req.params.id, 10);
	db.todo.destroy({
		where: {
			id: todoID,
			userId: req.user.get('id')
		}
	}).then(function(rowsDeleted) {
		// if 0 id didnt exists, 1 if deleted
		if (rowsDeleted === 0) {
			res.status(404).json({
				error: "No todo with id"
			});
		} else {
			res.status(204).send();
		}
	}).catch(function(e) {
		res.status(500).send();
	});
});

// PUT /todos/:id
app.put('/todos/:id', middleware.requireAuthentication, function(req, res) {
	var todoID = parseInt(req.params.id, 10);
	var where = {
		id: todoID,
		userId: req.user.get('id')
	}
	var body = _.pick(req.body, 'description', 'completed');
	var attribute = {};

	//body.hasOwnProperty('completed')
	if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
		attribute.completed = body.completed;
	}

	if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
		attribute.description = body.description;
	}
	db.todo.findOne(where).then(function(todo) {
		if (todo) {
			todo.update(attribute).then(function(todo) {
				res.json(todo.toJSON());
			}, function(e) {
				res.status(400).json(e);
			});
		} else {
			res.status(404).send();
		}
	}, function() {
		res.status(500).send();
	});
});

// POST /users/login <- new route
app.post('/users/login', function(req, res) {
	var body = _.pick(req.body, 'email', 'password');
	var userInstance;
	db.user.authenticate(body).then(function(user) {
		var token = user.generateToken('authentication');
		userInstance = user;
		// save token into database
		return db.token.create({
			token: token
		});
	}).then(function(tokenInstance) {
		res.header('Auth', tokenInstance.get('token')).json(userInstance.toPublicJSON());
	}).catch(function(e) {
		res.status(401).json(e);
	});

});

//DELETE /users/login

app.delete('/users/login', middleware.requireAuthentication, function(req, res) {
	req.token.destroy().then(function() {
		return res.status(204).send();
	}).catch(function() {
		return res.status(500).send();
	})
});

db.sequelize.sync({
	force: true
}).then(function() {
	app.listen(PORT, function() {
		console.log('Express listening on port: ' + PORT + '!');
	});
});