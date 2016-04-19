'use strict';
var fs = require('fs');
var http = require('http');
var IO = require('socket.io');

class CServer {
  constructor(app) {
    this.app = http.createServer(app).listen(3000);
    this.io = IO(this.app);
    this.setGlobals();
  }

  setGlobals() {
    global._ = require('lodash');
    global.async = require('async');

    fs.readdir(__dirname + '/../handlers', (err, handlers) => {
      _.forEach(handlers, (handler) => {
        global[handler.split('.').shift()] = require(__dirname + '/../handlers/' + handler).getInstance();
      });
    });
  }

  lift() {
    this.io.on('connection', (socket) => {
      console.log('Client connected');

      socket.on('disconnect', () => {
        console.log('Client disconnected');
      });
    });
  }
}

module.exports = CServer;