'use strict';
var fs = require('fs');
var _ = require('lodash');
var async = require('async');
var Canvas = require('canvas');
var request = require('request').defaults({encoding: null});

class CPuzzler {
  constructor() {
  }

  static getInstance() {
    if (!(this.instance instanceof CPuzzler)) {
      this.instance = new CPuzzler();
    }
    return this.instance;
  }

  builder(image, done) {
    var self = this;
    async.waterfall([
      _.partial(self.loadImages, self, image),
      _.partial(self.renderChunks, self)
    ], done);
  }

  loadImages(self, originLink, done) {
    async.parallel({
      chunks: self.getChunks,
      origin: _.partial(self.getOrigin, originLink)
    }, done);
  }

  renderChunks(self, images, done) {
    var canvases = {
      origin: self.canvas(800, 400),
      chunk: self.canvas(130, 130),
      mask: self.canvas(130, 130)
    };

    canvases.origin.ctx.drawImage(images.origin, 0, 0, 800, 400);
    canvases.chunk.ctx.drawImage(images.chunks.new, 0, 0);
    canvases.mask.ctx.putImageData(
      canvases.origin.ctx.getImageData(0, 0, 130, 130),
      0,
      0
    );
    canvases.chunk.ctx.globalCompositeOperation = "source-in";
    canvases.chunk.ctx.drawImage(canvases.mask.canvas, 0, 0);

    done(null, canvases.chunk.canvas.toDataURL('image/png'));
  }

  canvas(width, height) {
    let canvas = new Canvas(width, height);
    return {
      canvas: canvas,
      ctx: canvas.getContext('2d')
    }
  }

  getChunks(done) {
    var filesNames = fs.readdirSync(__dirname + '/../chunks');
    var files = {};
    async.each(filesNames, (file, next) => {
      fs.readFile(__dirname + '/../chunks/' + file, (err, data) => {
        if (err) {
          throw err;
        }

        var image = new Canvas.Image;
        image.src = data;
        files[file.split('.').shift()] = image;

        next();
      });
    }, () => {
      done(null, files)
    });
  }

  getOrigin(link, done) {
    request.get(link, (err, res, body) => {
      if (err) {
        throw err;
      }

      var image = new Canvas.Image;
      image.src = body;

      done(null, image);
    });
  }
}

module.exports = CPuzzler;