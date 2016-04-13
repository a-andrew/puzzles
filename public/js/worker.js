'use strict';

$(function () {
  $('#helloBtn').click(() => {
    Socket.socket.emit('helloMsg', 'Server, hello');
  });

  $('#getPuzzle').click(() => {
    var img = $('#image').val();
    $.ajax({
      url: 'http://localhost:3000/builder',
      type: 'GET',
      data: img,
      success: function (data) {
        if (data.err) {
          return console.error(err);
        }

        $('#result').append('<img src=' + data.data + '>');
      }
    });
  });

  $('#getImgData').click(() => {
    var canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 400;
    var imageWidth = 800;
    var imageHeight = 400;
    var context = canvas.getContext('2d');
    var image = new Image();
    image.src = '../yellowstone.jpg';

    image.onload = function () {
      context.drawImage(image, 0, 0, imageWidth, imageHeight);

      var newCanvas = document.createElement('canvas');
      var newContext = newCanvas.getContext('2d');
      var outCanvas = document.createElement('canvas');
      var outContext = outCanvas.getContext('2d');
      var newImage = new Image();
      newImage.src = '../puzzle_pieces/new.png';
      newImage.onload = function () {
        newContext.drawImage(newImage, 0, 0);
        outContext.putImageData(context.getImageData(0, 0, newImage.width, newImage.height), 0, 0);
        newContext.globalCompositeOperation = "source-in";
        newContext.drawImage(outCanvas, 0, 0);

        $('#result').append(newCanvas);
      };
    };
  });
});