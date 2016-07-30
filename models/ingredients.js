'use strict';

const Bookshelf = require('../bookshelf');

require('./recipes');
var Ingredients = Bookshelf.Model.extend({
	tableName: 'ingredients',
	recipes: function () {
		return this.belongsTo('Recipes', 'url');
	}
});

module.exports = Bookshelf.model('Ingredients', Ingredients);
