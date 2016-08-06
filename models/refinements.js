'use strict';

const Bookshelf = require('../bookshelf');

var Refinements = Bookshelf.Model.extend({
	tableName: 'refinements'
});

module.exports = Bookshelf.model('Weekview', Refinements);
