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
		}).fetch({
			withRelated: ['directions', 'ingredients']
		});
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
	},
	relatedRecipes: function (id) {
		/*
		SELECT t2.recipe_id, SUM(CASE WHEN t1.name IS NOT NULL THEN 1 ELSE 0 END) AS matches
		FROM ingredient_relations t1
		RIGHT JOIN ingredient_relations t2
		ON t1.name = t2.name
		AND t1.recipe_id = 1
		WHERE t2.recipe_id <> 1
		GROUP BY t2.recipe_id
		ORDER BY matches desc;
		*/
		return new Promise((resolve, reject) => {
			let countScore = Bookshelf.knex.raw('SUM(CASE WHEN t1.name IS NOT NULL THEN 1 ELSE 0 END) AS matches')
			Bookshelf.knex
				.select('t2.recipe_id', countScore) //SELECT t2.recipe_id
				.from('ingredient_relations as t1') //FROM ingredient_relations t1
				.rightJoin('ingredient_relations as t2', function () { //RIGHT JOIN ingredient_relations t2
					this.on('t1.name', '=', 't2.name').andOn('t1.recipe_id', '=', id) //ON t1.name = t2.name AND t1.recipe_id = 1
				})
				.where('t2.recipe_id', '<>', id) //WHERE t2.recipe_id <> 1
				.groupBy('t2.recipe_id') //GROUP BY t2.recipe_id
				.orderBy('matches', 'desc') //ORDER BY t2.recipe_id
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
