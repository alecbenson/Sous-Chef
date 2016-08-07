'use strict';

require('./recipes');
const Bookshelf = require('../bookshelf');

var Ingredients = Bookshelf.Model.extend({
	tableName: 'ingredients',
	recipes: function () {
		return this.belongsTo('Recipes');
	}
});

module.exports = Bookshelf.model('Ingredients', Ingredients);
