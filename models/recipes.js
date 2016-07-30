'use strict';

require('./ingredients');
require('./directions');
const Bookshelf = require('../bookshelf');

var Recipes = Bookshelf.Model.extend({
	tableName: 'recipes',
	ingredients: function () {
		return this.hasMany('Ingredients');
	},
	directions: function () {
		return this.hasMany('Directions');
	}
});

module.exports = Bookshelf.model('Recipes', Recipes);
