'use strict'

var config = require('./config.js');

var knex = require('knex')({
	client: 'mysql',
	connection: {
		host: '127.0.0.1',
		user: config.mysql_user,
		password: config.mysql_db,
		database: config.mysql_db
	}
});

module.exports = require('bookshelf')(knex);
