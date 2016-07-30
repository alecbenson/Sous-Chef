'use strict';

const Bookshelf = require('../bookshelf');

require('./recipes');
var Directions = Bookshelf.Model.extend({
	tableName: 'directions',
	recipe: function () {
		return this.belongsTo('Recipes', 'url');
	}
});

module.exports = Bookshelf.model('Directions', Directions);
