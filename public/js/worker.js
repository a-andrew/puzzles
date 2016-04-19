'use strict';

$(function() {
  var settings = {};

  $('#calculate').click(() => {
    var img = $('#image').val();
    $.ajax({
      url: 'http://localhost:3000/calculate',
      type: 'PUT',
      data: {image: img},
      success: function(data) {
        if(data.err) {
          return console.error(data.err);
        }

        $('#result').append('<p>Width: ' + data.data.image.width);
        $('#result').append('<p>Height: ' + data.data.image.height);
        $('#result').append('<p>Size: ' + data.data.size);
      }
    });
  });

  $('#getPuzzle').click(() => {
    $.ajax({
      url: 'http://localhost:3000/builder',
      type: 'PUT',
      success: function(data) {
        if(data.err) {
          return console.error(data.err);
        }

        for(var i = 0; i < data.length; ++i) {
          for(var j = 0; j < data[i].length; ++j) {
            $('#result').append('<img style="margin-right: -15px; margin-bottom: -17px;" src="' + data[i][j] + '">');
          }

          $('#result').append('<br>');
        }
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

    image.onload = function() {
      context.drawImage(image, 0, 0, imageWidth, imageHeight);

      var newCanvas = document.createElement('canvas');
      var newContext = newCanvas.getContext('2d');
      var outCanvas = document.createElement('canvas');
      var outContext = outCanvas.getContext('2d');
      var newImage = new Image();
      newImage.src = '../0001.png';
      newImage.onload = function() {
        newContext.drawImage(newImage, 0, 0, 25, newImage.height * (25 / newImage.width));
        $('#result').append(newCanvas);
        /*
         outContext.putImageData(context.getImageData(0, 0, newImage.width, newImage.height), 0, 0);
         newContext.globalCompositeOperation = "source-in";
         newContext.drawImage(outCanvas, 0, 0);*/

      };
    };
  });
});