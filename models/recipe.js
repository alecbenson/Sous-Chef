'use strict';

const bookshelf = require('../bookshelf');

var Recipe = bookshelf.Model.extend({
	tableName: 'recipes'
});

module.exports = Recipe;
