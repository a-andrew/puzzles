'use strict';

var connect = require('connect');
var bodyParser = require('body-parser');
var CRouter = require(__dirname + '/classes/CRouter');
var CServer = require(__dirname + '/classes/CServer');
var CResponse = require(__dirname + '/classes/CResponse');

var app = connect();

app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use(CResponse.responses);
app.use(CRouter.router);
app.use((err, req, res, next) => {
  console.error(err);
});

var server = new CServer(app);

server.lift();