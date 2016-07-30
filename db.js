'use strict'

var Promise = require('bluebird');
var mysql = require('mysql');

Promise.promisifyAll(mysql);
Promise.promisifyAll(require('mysql/lib/Connection').prototype);
Promise.promisifyAll(require('mysql/lib/Pool').prototype);


var config = require('./config.js');
const creds = {
	host: 'localhost',
	user: config.mysql_user,
	password: config.mysql_pass,
	database: config.mysql_db
}

const pool = mysql.createPool(creds);

module.exports = () => {
	return pool.getConnectionsAsync().disposer(function (connection) {
		connection.release();
	});
};
