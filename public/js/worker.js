'use strict';

$(function () {
  $('#helloBtn').click(() => {
    Socket.socket.emit('helloMsg', 'Server, hello');
  });
});