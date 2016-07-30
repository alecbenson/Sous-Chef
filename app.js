'use strict';

var program = require('commander');
var winston = require('winston');

//Used to specify the port that the application runs on
program
	.version('0.0.1')
	.option('-p, --port <n>', 'the port to run the server on', Number, 8080)
	.parse(process.argv);

//Set up express
var express = require('express');
var app = express();
app.set('view engine', 'pug');

//Load our controlers
app.use(express.static(__dirname + '/public'));
app.use(require('./controllers'));

//Listen on the specified port
var server = app.listen(program.port, function () {
	winston.log('info', 'Node process ' + process.pid +
		' is listening on port ' + program.port);
});

//Exit nicely on SIGTERM
process.on('SIGTERM', function () {
	server.close(function () {
		winston.log('info', 'bye');
		process.exit(0);
	});
});
