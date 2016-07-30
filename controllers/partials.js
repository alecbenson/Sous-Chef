'use strict';

var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');

//Get body-parser data
router.use(bodyParser.urlencoded({
	extended: false
}));
router.use(bodyParser.json());

//Find partial with this name
router.get('/:name', function (req, res) {
	var name = req.params.name;
	if (!name) {
		res.sendStatus(400); //Bad request;
	}
	res.render('partials/' + name);
});


module.exports = router;
