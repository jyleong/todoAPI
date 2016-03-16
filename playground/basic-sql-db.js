var Sequelize = require('sequelize');
var sqlize = new Sequelize(undefined, undefined, undefined, {
	'dialect': 'sqlite',
	'storage': __dirname + '/basic-sqlite-databse.sqlite'
});

var Todo = sqlize.define('todo', {
	description: {
		type: Sequelize.STRING,
		allowNull: false,
		validate: {
			len: [1, 250]
		}
	},
	completed: {
		type: Sequelize.BOOLEAN,
		allowNull: false,
		defaultValue: false
	}
});

// doing force true drops db starts from new
sqlize.sync(/*{
	force: true
}*/).then(function() {
	console.log('Everything is synched');

	/*Todo.create({
		description: "Take out trash"

	}).then(function(todo) {
		return Todo.create({
			description: "Clean office"
		}).then(function() {
			//return Todo.findById(1)
			return Todo.findAll({
				where:{
					description: {
						$like: '%trash%'
					}
				}
			});
		}).then(function(todos) {
			if (todos) {
				todos.forEach(function(todo) {
					console.log(todo.toJSON());
				})
				//console.log(todos.toJSON());
			} else {
				console.log("no todo found");
			}
		});
	}).catch(function(e) {
		console.log(e);
	});*/
	// fetch todo by its id
	Todo.findById(2).then(function(todo) {
		if (todo){
			console.log(todo.toJSON());
		}
		else {
			console.log("not found");
		}
	});
});