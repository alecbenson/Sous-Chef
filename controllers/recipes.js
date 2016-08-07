'use strict';

var Recipes = require('../models/recipes');
var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();

router.use(bodyParser.urlencoded({
	extended: false
}));
router.use(bodyParser.json());

router.get('/id/:id', function (req, res) {
	var id = parseInt(req.params.id);
	Recipes.forge().getById(id).then(function (result) {
		res.json(result);
	})
});

router.get('/ingredients/:id', function (req, res) {
	var id = parseInt(req.params.id);
	new Recipes({
		id: id
	}).related('ingredients').fetch().then(function (result) {
		res.json(result);
	})
});

router.get('/scored/noanchor/:limit', function (req, res) {
	var limit = parseInt(req.params.limit) || 7;
	Recipes.forge().scoredRecipes(limit).then(function (results) {
		res.json(results);
	}).catch(function () {
		res.sendStatus(500);
	});
});

router.get('/scored/anchor/:limit', function (req, res) {
	var limit = parseInt(req.params.limit) || 7;
	Recipes.forge().scoredRecipesByAnchor(limit).then(function (results) {
		res.json(results);
	}).catch(function () {
		res.sendStatus(500);
	});
});

router.get('/related/id/:id', function (req, res) {
	var id = parseInt(req.params.id);
	Recipes.forge().relatedRecipes(id).then(function (results) {
		res.json(results);
	}).catch(function () {
		res.sendStatus(500);
	});
});

module.exports = router;
