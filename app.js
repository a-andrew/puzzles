'use strict';

var fs = require('fs');
var url = require('url');
var http = require('http');
var colors = require('colors');

var server = http.createServer((req, res) => {
  var filename = url.parse(req.url).pathname.substr(1)
    ? url.parse(req.url).pathname.substr(1)
    : 'index.html';

  fs.readFile([__dirname, 'public', filename].join('/'), (err, content) => {
    if (err) {
      res.writeHead(404);
      return res.end('Oops, page not found');
    }

    res.writeHead(200, {'Content-Type': getContentType(filename)});
    res.end(content);
  });

  function getContentType(path) {
    let type;

    switch (path.split('.').pop()) {
      case 'html':
        type = 'text/html';
        break;
      case 'js':
        type = 'text/javascript';
        break;
      case 'css':
        type = 'text/css';
        break;
      case 'jpg':
      case 'jpeg':
        type = 'image/jpeg';
        break;
      case 'png':
        type = 'image/png';
        break;
    }

    return type;
  }
});

server.listen(3000);

var io = require('socket.io')(server);

io.sockets.on('connection', (socket) => {
  console.log(`client is connected`.green);

  socket.on('helloMsg', (msg) => {
    console.log(msg);
    socket.emit('helloMsg', 'Hello client'.red);
  })
});