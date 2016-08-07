'use strict';

require('./ingredients');
require('./directions');
const Bookshelf = require('../bookshelf');

var Recipes = Bookshelf.Model.extend({
	tableName: 'recipes',
	idAttribute: 'id',
	ingredients: function () {
		return this.hasMany('Ingredients');
	},
	directions: function () {
		return this.hasMany('Directions');
	},
	getById: function (id) {
		return this.where({
			id: id
		}).fetch();
	}
});

Recipes.prototype.extend

module.exports = Bookshelf.model('Recipes', Recipes);
