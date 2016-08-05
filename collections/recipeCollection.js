'use strict';

const Bookshelf = require('../bookshelf');

var RecipesCollection = Bookshelf.Collection.extend({
	model: require('../models/recipes')
});

module.exports = Bookshelf.collection('RecipeCollection', RecipesCollection);
