'use strict';

var fs = require('fs');
var url = require('url');
var path = require('path');

class CRouter {
  constructor() {}

  static static(req, res) {
    var uri = url.parse(req.url).pathname;
    uri = CRouter.staticFolder() + (uri == '/' ? '/index.html' : uri);
    var filename = path.join(process.cwd(), uri);
    fs.exists(filename, function(exists) {
      if(!exists) {return res.notFound('Oops, page not found\n')}

      res.writeHead(200, CRouter.mimeType(path.extname(filename).slice(1)));
      fs.createReadStream(filename).pipe(res);
    });
  }

  static router(req, res) {
    var route = req.method + ' ' + req.url.split('?').shift();
    if(typeof CRouter.routes()[route] === 'string') {
      let parts = CRouter.routes()[route].split('.');
      let action;
      if(typeof (action = _.get(global, parts[0] + '.' + parts[1])) === 'function') {
        action.bind(global[parts[0]], req, res)();
      }
    } else {
      CRouter.static(req, res);
    }
  }

  static staticFolder() {
    return '/public';
  }

  static mimeType(ext) {
    return {
      "html": "text/html",
      "jpeg": "image/jpeg",
      "jpg": "image/jpeg",
      "png": "image/png",
      "js": "text/javascript",
      "css": "text/css"
    }[ext];
  }

  static routes() {
    return {
      'PUT /builder': 'CPuzzler.build',
      'PUT /calculate': 'CPuzzler.calculate'
    }
  }
}

module.exports = CRouter;