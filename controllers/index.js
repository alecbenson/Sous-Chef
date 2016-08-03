'use strict';

//This is the base controller which is responsible for loading all other controllers
var express = require('express');
var router = express.Router();

//Partial view API
router.use('/partials', require('./partials'));

//home page
router.get('/', function (req, res) {
	res.render('index', {
		title: 'Sous-Chef'
	});
});

//recipes api
router.use('/recipes', require('./recipes'));

module.exports = router;
