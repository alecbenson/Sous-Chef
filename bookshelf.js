'use strict'

var config = require('./config.js');
var winston = require('winston');

var knex = require('knex')({
	client: 'mysql',
	connection: {
		user: config.mysql_user,
		database: config.mysql_db
	}
});

var bookshelf = require('bookshelf')(knex);
bookshelf.plugin('registry');

bookshelf.knex.schema.hasTable('recipes').then(function (exists) {
	if (!exists) {
		bookshelf.knex.schema.createTable('recipes', function (table) {
			table.increments().primary();
			table.string('url').unique();
			table.string('title');
			table.string('description');
			table.string('notes');
			table.string('image');
			table.integer('readyTime');
			table.integer('reviews');
			table.float('stars');
			table.integer('madeCount');
		}).then(function () {
			winston.info('recipes table created');
		});
	} else {
		winston.info('ingredients table already exists, skipping creation');
	}
});

bookshelf.knex.schema.hasTable('ingredients').then(function (exists) {
	if (!exists) {
		bookshelf.knex.schema.createTable('ingredients', function (table) {
			table.integer('recipe_id').unsigned().references('recipes.id');
			table.increments().primary();
			table.string('name');
		}).then(function () {
			winston.info('ingredients table created');
		});
	} else {
		winston.info('ingredients table already exists, skipping creation');
	}
});

bookshelf.knex.schema.hasTable('directions').then(function (exists) {
	if (!exists) {
		bookshelf.knex.schema.createTable('directions', function (table) {
			table.integer('recipe_id').unsigned().references('recipes.id');
			table.increments().primary();
			table.string('step');
		}).then(function () {
			winston.info('directions table created');
		});
	} else {
		winston.info('ingredients table already exists, skipping creation');
	}
});

bookshelf.knex.schema.hasTable('refinements').then(function (exists) {
	if (!exists) {
		bookshelf.knex.schema.createTable('refinements', function (table) {
			table.integer('id').primary();
			table.integer('stars');
			table.integer('efficiency');
			table.integer('readyTime');
			table.integer('madeCount');
			table.integer('reviews');
		}).then(function () {
			winston.info('refinements table created');
		});
	} else {
		winston.info('refinements table already exists, skipping creation');
	}
});

module.exports = bookshelf;
