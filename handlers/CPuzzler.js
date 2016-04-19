'use strict';
var fs = require('fs');
var _ = require('lodash');
var async = require('async');
var Canvas = require('canvas');
var request = require('request').defaults({encoding: null});

class CPuzzler {
  constructor() {
    this.settings = {
      area: {
        width: 900,
        height: 500
      },
      chunks: {
        width: 50,
        height: 50,
        tailWidthX: 0,
        tailWidthY: 0,
        tail: 34,
        rows: 0,
        cols: 0
      }
    }
  }

  static getInstance() {
    if(!(this.instance instanceof CPuzzler)) {
      this.instance = new CPuzzler();
    }
    return this.instance;
  }

  calculate(req, res) {
    var self = this;
    self.loadImages(self, req.body.image, (err, images) => {
      if(err) {return done(err)}

      images.origin = self.chooseImageDims(self, images.origin);
      self.chooseChunkDims(self);

      self.settings.area.image = images.origin;
      self.settings.chunks.all = images.chunks;

      res.json({
        err: err, data: {
          image: {
            width: self.settings.area.width,
            height: self.settings.area.height
          },
          size: self.settings.chunks.rows + 'x' + self.settings.chunks.cols
        }
      });
    });
  }

  chooseImageDims(self, image) {
    var sizes = {
      image: image
    };

    if(image.width <= self.settings.area.width
      && image.height <= self.settings.area.height
    ) {
      sizes.width = self.settings.area.width = image.width;
      sizes.height = self.settings.area.height = image.height;
    } else if(image.width > self.settings.area.width) {
      if(image.height <= self.settings.area.height) {
        sizes.width = image.width;
        sizes.height = self.settings.area.height = image.height;
      } else {
        sizes.width = self.settings.area.width;
        sizes.height = self.settings.area.height = Math.round(image.height * (self.settings.area.width / image.width));
      }
    } else if(image.height > self.settings.area.height) {
      sizes.width = self.settings.area.width = image.width;
      sizes.height = image.height;
    }

    return sizes;
  }

  chooseChunkDims(self) {
    self.settings.chunks.rows = Math.ceil(self.settings.area.height / self.settings.chunks.height);
    self.settings.chunks.cols = Math.ceil(self.settings.area.width / self.settings.chunks.width);

    var neededW = self.settings.area.width / self.settings.chunks.cols;
    var neededH = self.settings.area.height / self.settings.chunks.rows;
    neededW && (self.settings.chunks.extraW = self.settings.chunks.width - neededW, self.settings.chunks.width = neededW);
    neededH && (self.settings.chunks.extraH = self.settings.chunks.height - neededH, self.settings.chunks.height = neededH);

    self.settings.chunks.tailWidthX = self.settings.chunks.width * (self.settings.chunks.tail / 100);
    self.settings.chunks.tailWidthY = self.settings.chunks.height * (self.settings.chunks.tail / 100);
  }

  build(req, res) {
    var self = this;
    async.waterfall([
      _.partial(self.buildGrid, self),
      _.partial(self.renderChunks, self)
    ], function(err, puzzles) {
      if(err) {return res.serverError(err)}

      res.json(puzzles);
    });
  }

  loadImages(self, originLink, done) {
    async.parallel({
      chunks: self.getChunks,
      origin: _.partial(self.getOrigin, originLink)
    }, done);
  }

  buildGrid(self, done) {
    var chunks = [];
    var chunksKeys = [];
    var rows = self.settings.chunks.rows;
    var cols = self.settings.chunks.cols;

    for(let row = 0; row < self.settings.chunks.rows; ++row) {
      for(let col = 0; col < self.settings.chunks.cols; ++col) {
        let mask = '';

        let prevs = [
          _.get(chunksKeys, row + '.' + (col - 1), null),
          _.get(chunksKeys, (row - 1) + '.' + col, null)
        ];

        if(prevs[0]) {
          mask += parseInt(prevs[0][2]) ? 0 : 1;
        } else {
          mask += 2;
        }
        if(prevs[1]) {
          mask += parseInt(prevs[1][3]) ? 0 : 1;
        } else {
          mask += 2
        }
        if(col != cols - 1) {
          mask += 0;
        } else {
          mask += 2;
        }
        if(row != rows - 1) {
          mask += 0;
        } else {
          mask += 2;
        }

        _.set(chunksKeys, row + '.' + col, mask);

        let offsetX = col * self.settings.chunks.width - self.settings.chunks.tailWidthX;
        let offsetY = row * self.settings.chunks.height - self.settings.chunks.tailWidthY;

        _.set(chunks, [row, col].join('.'), {
          mask: self.settings.chunks.all[mask],
          offsetX: offsetX > 0 ? offsetX : 0,
          offsetY: offsetY > 0 ? offsetY : 0
        });
      }
    }

    done(null, chunks);
  }

  renderChunks(self, chunks, done) {
    var puzzles = [];
    var origin = self.canvas(self.settings.area.image.width, self.settings.area.image.height);
    origin.ctx.drawImage(
      self.settings.area.image.image,
      0,
      0,
      self.settings.area.image.width,
      self.settings.area.image.height);


    for(let i = 0; i < chunks.length; ++i) {
      for(let j = 0; j < chunks[i].length; ++j) {
        var chunkWidth = chunks[i][j].mask.width - self.settings.chunks.extraW;
        var chunkHeight = chunks[i][j].mask.height - self.settings.chunks.extraH;
        var canvases = {
          chunk: self.canvas(chunkWidth, chunkHeight),
          mask: self.canvas(chunkWidth, chunkHeight)
        };
        canvases = _.merge(canvases, {origin: origin});


        canvases.chunk.ctx.drawImage(chunks[i][j].mask, 0, 0, chunkWidth, chunkHeight);
        canvases.mask.ctx.putImageData(
          canvases.origin.ctx.getImageData(
            _.get(chunks, [i, (j - 1), '.offsetX'].join('.'), 0),
            _.get(chunks, [i, (j - 1), '.offsetY'].join('.'), 0),
            chunkWidth,
            chunkHeight),
          0,
          0
        );
        canvases.chunk.ctx.globalCompositeOperation = "source-in";
        canvases.chunk.ctx.drawImage(canvases.mask.canvas, 0, 0, chunkWidth, chunkHeight);

        _.set(puzzles, [i, j].join('.'), canvases.chunk.canvas.toDataURL('image/png'));
      }
    }

    done(null, puzzles);
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
        if(err) {
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
      if(err) {
        throw err;
      }

      var image = new Canvas.Image;
      image.src = body;

      done(null, image);
    });
  }

  /*  bind(func, context) {
   return function() {
   return func.apply(context, arguments);
   };
   }*/
}

module.exports = CPuzzler;