'use strict';

var Refinements = require('../models/refinements');
var Bookshelf = require('../bookshelf');
var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();
var util = require('util');

router.use(bodyParser.urlencoded({
	extended: false
}));
router.use(bodyParser.json());

router.get('/', function (req, res) {
	Refinements.query(function (qb) {
		qb.offset(0);
	}).fetch().then(function (result) {
		res.json(result);
	})
});

router.post('/', function (req, res) {

	var refinements = {
		stars: req.body.stars,
		efficiency: req.body.efficiency,
		madeCount: req.body.madeCount,
		readyTime: req.body.readyTime,
		reviews: req.body.reviews
	};

	//Why the fuck is an upsert so hard, EW GROSS GROSS GROSS I DON'T LIKE IT
	let insert = Bookshelf.knex('refinements').insert(refinements);
	delete refinements.id;
	let update = Bookshelf.knex('refinements').update(refinements);
	let query = util.format('%s ON DUPLICATE KEY UPDATE %s',
		insert.toString(), update.toString().replace(/^UPDATE `[^`]+` set /i, ''));
	return Bookshelf.knex.raw(query).then(function() {
		res.json(200);
	})
});

module.exports = router;
