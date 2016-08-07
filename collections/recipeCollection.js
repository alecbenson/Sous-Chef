'use strict';

const Bookshelf = require('../bookshelf');
var Promise = require('bluebird');

var RecipesCollection = Bookshelf.Collection.extend({
	model: require('../models/recipes'),
	sortedRecipes: function (limit) {
		return new Promise((resolve, reject) => {
			Bookshelf.knex
				.select('*')
				.table('recipes')
				.joinRaw(' a ')
				.joinRaw('ORDER BY score(a.stars, a.reviews, a.madeCount, a.readyTime) desc')
				.limit(limit)
				.then((results) => {
					resolve(results);
				})
				.catch((err) => {
					reject(err);
				});
		});
	}
});

module.exports = Bookshelf.collection('RecipeCollection', RecipesCollection);


/*
similarRecipes: function (limit) {
	return new Promise((resolve, reject) => {
		this.sortedRecipes(1).then((top) => {

		});
	})
}
*/
