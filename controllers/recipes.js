'use strict';

var RecipesCollection = require('../collections/recipeCollection');
var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();
var Bookshelf = require('../bookshelf');

router.use(bodyParser.urlencoded({
	extended: false
}));
router.use(bodyParser.json());

router.get('/limit/:limit', function (req, res) {
	var limit = parseInt(req.params.limit);
	RecipesCollection.forge()
		.query(function (qb) {
			qb.offset(0).limit(limit);
		})
		.fetch().then(function (result) {
			res.json(result);
		})
});

//select * from recipes as a order by score(a.stars, a.reviews, a.madeCount, a.readyTime) desc;
router.get('/sorted/:limit', function (req, res) {
	var limit = parseInt(req.params.limit) || 7;
	Bookshelf.knex
		.select('*')
		.table('recipes')
		.joinRaw(' a ')
		.joinRaw('ORDER BY score(a.stars, a.reviews, a.madeCount, a.readyTime) desc')
		.limit(limit)
		.then((results) => {
			res.json(results);
		})
		.catch((err) => {
			console.log(err);
			res.sendStatus(500);
		});
});

module.exports = router;
