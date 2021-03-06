'use strict';

require('./ingredients');
require('./directions');
const Bookshelf = require('../bookshelf');

var scoredRecipes = function (limit, offset, like) {
	//select * from recipes as a
	//order by score(a.stars, a.reviews, a.madeCount, a.readyTime) desc
	//limit *;
	let likeSearch = like ? Bookshelf.knex.raw('?', [`%${like}%`]) : '%';
	let scoreFunc = Bookshelf.knex.raw('scoreWithoutAnchor(a.id)');
	return Bookshelf.knex
		.select('*')
		.table('recipes as a')
		.where('a.title', 'like', likeSearch)
		.orWhere('a.description', 'like', likeSearch)
		.orderBy(scoreFunc, 'desc')
		.limit(limit)
		.offset(offset);
}

var scoredRecipesByAnchor = function (limit, offset, like) {
	return scoredRecipes(1).then((anchor) => {
		if (!anchor) {
			console.log('Could not determine anchor recipe');
			return [];
		}
		let likeSearch = like ? Bookshelf.knex.raw('?', [`%${like}%`]) : '%';
		var anchorId = anchor[0].id;
		let scoreFunc = Bookshelf.knex.raw('scoreWithAnchor(' + anchorId + ', a.id)');
		return Bookshelf.knex
			.select('*')
			.table('recipes as a')
			.where('a.title', 'like', likeSearch)
			.orWhere('a.description', 'like', likeSearch)
			.orderBy(scoreFunc, 'desc')
			.limit(limit)
			.offset(offset);
	})
}

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
var relatedRecipes = function (id) {
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
	//Scores recipes simply by priorities, nothing else.
	scoredRecipes: function (limit) {
		return scoredRecipes(limit);
	},
	scoredRecipesByAnchor: function (limit, offset, like) {
		return scoredRecipesByAnchor(limit, offset, like);
	},
	relatedRecipes: function (id, offset) {
		return relatedRecipes(id), offset;
	}
});

module.exports = Bookshelf.model('Recipes', Recipes);
