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
	},
	//select * from recipes as a order by score(a.stars, a.reviews, a.madeCount, a.readyTime) desc limit *;
	scoredRecipes: function (limit) {
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
					console.log(err);
					reject(err);
				});
		});
	}
});

module.exports = Bookshelf.model('Recipes', Recipes);
