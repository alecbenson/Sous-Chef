'use strict';

require('./recipes');
const Bookshelf = require('../bookshelf');

var Weekview = Bookshelf.Model.extend({
	tableName: 'weekview',
	recipes: function () {
		return this.hasOne('Recipes');
	}
});

module.exports = Bookshelf.model('Weekview', Weekview);
