var Sequelize = require('sequelize'); // sequelize library
var sequelize = new Sequelize(undefined, undefined, undefined, {
	'dialect': 'sqlite',
	'storage': __dirname + '/data/dev-todo-api.sqlite'
});

var db = {};

db.todo = sequelize.import(__dirname +'/models/todo.js');
db.sequelize = sequelize; // creates new sqlite db, loads new model
db.Sequelize = Sequelize;

module.exports = db;