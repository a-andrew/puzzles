'use strict';

class CSocket {
  constructor() {
    this.socket = io.connect();
    this.addListeners();
  }

  static getInstance() {
    if (!this.instanse) {
      this.instanse = new CSocket();
    }
    return this.instanse;
  }

  addListeners() {
    this.socket.on('helloMsg', (msg) => {
      console.log(msg);
    })
  }
}

var Socket = CSocket.getInstance();