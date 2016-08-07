'use strict';

require('./recipes');
const Bookshelf = require('../bookshelf');

var Directions = Bookshelf.Model.extend({
	tableName: 'directions',
	hasTimestamps: true,
	recipes: function () {
		return this.belongsTo('Recipes');
	}
});

module.exports = Bookshelf.model('Directions', Directions);
