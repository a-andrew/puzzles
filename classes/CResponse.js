'use strict';

class CResponse {
  constructor() {}

  static responses(req, res, next) {
    Object.defineProperties(res, {
      okay: {value: CResponse.okay.bind(res)},
      html: {value: CResponse.html.bind(res)},
      json: {value: CResponse.json.bind(res)},
      notFound: {value: CResponse.notFound.bind(res)},
      serverError: {value: CResponse.serverError.bind(res)}
    });

    next();
  }

  static okay(msg) {
    this.writeHead(200, {'Content-Type': 'text/plain'});
    this.end(msg);
  }

  static html(html) {
    this.writeHead(200, {'Content-Type': 'text/html'});
    this.end(html);
  }

  static json(data) {
    this.writeHead(200, {'Content-Type': 'application/json'});
    this.end(JSON.stringify(data));
  }

  static notFound(msg) {
    this.writeHead(404, {'Content-Type': 'text/plain'});
    this.end(msg);
  }

  static serverError(msg) {
    this.writeHead(503, {'Content-Type': 'text/plain'});
    this.end(JSON.stringify(msg));
  }
}

module.exports = CResponse;