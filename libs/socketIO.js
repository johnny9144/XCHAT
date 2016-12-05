"use strict";
var debug = require("debug")("dev");
var self = module.exports;

self.IO = function ( io) {
  io.on( 'connection', function (socket) {
    debug( 'user: ' + socket.id + ' in');
    // 在Cache加上，每個User的socket
    socket.on( 'msg', function (data) {
      console.log(data);
    });
    socket.on( 'disconnect', function (){
      debug( 'user: ' + socket.id + ' leave');
    });
  });
};
