'use strict';

const Bookshelf = require('../bookshelf');

var Ingredient_Relations = Bookshelf.Model.extend({
	tableName: 'ingredient_relations'
});

module.exports = Bookshelf.model('Ingredient_Relations', Ingredient_Relations);
