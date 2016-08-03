'use strict';

var Recipes = require('../models/recipes');
var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();

router.use(bodyParser.urlencoded({
	extended: false
}));
router.use(bodyParser.json());

router.get('/:limit', function (req, res) {
	var limit = parseInt(req.params.limit);
	Recipes.query(function (qb) {
		qb.offset(0).limit(limit);
	}).fetchAll().then(function (result) {
		res.json(result);
	})
});

module.exports = router;
