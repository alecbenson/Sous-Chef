'use strict';

const Promise = require('bluebird');
const db = require('../db');

module.exports = (param) => {
	const title = param.title;

	return Promise.using(db(), conn => {
		const sql = 'insert into recipe (title) values(?)';
		return conn.queryAsync(sql, [title]);
	});
};
