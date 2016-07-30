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

var bookshelf = require('bookshelf')(knex);
bookshelf.plugin('registry');


bookshelf.knex.schema.createTable('recipes', function(table) {
	table.string('url').primary();
	table.string('title');
	table.string('image');
	table.string('readyTime');
	table.integer('reviews');
	table.float('stars');
});

bookshelf.knex.schema.createTable('ingredients', function(table) {
	table.string('url').primary();
	table.string('name');
});

bookshelf.knex.schema.createTable('directions', function(table) {
	table.string('url').primary();
	table.increments('step');
	table.timestamps();
});

module.exports = require('bookshelf')(knex);
