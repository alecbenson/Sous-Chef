'use strict';

var RecipesCollection = require('../collections/recipeCollection');
var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();

router.use(bodyParser.urlencoded({
	extended: false
}));
router.use(bodyParser.json());

router.get('/:limit', function (req, res) {
	var limit = parseInt(req.params.limit);
	RecipesCollection.forge()
		.query(function (qb) {
			qb.offset(0).limit(limit);
		})
		.fetch().then(function (result) {
			res.json(result);
		})
});

//TODO:
/*
router.get('/:mainCourse', function (req, res) {
	//var refinements = req.params.refinements;
	RecipesCollection.forge()
		.query(function (qb) {
			qb.orderBy('score', 'DESC');
		})
		.fetchOne().then(function (result) {
			res.json(result);
		})
});
*/

module.exports = router;
