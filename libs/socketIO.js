"use strict";
var debug = require("debug")("dev");
var self = module.exports;
var userStatus = {};

self.IO = function ( io) {
  io.on( 'connection', function (socket) {
    socket.on( 'regist', function (data){
      if ( data && data.secret && !userStatus[data.secret]){
        userStatus[data.secret] = [];
        userStatus[data.secret].push( socket.id);
      } else if ( data && data.secret ) {
        userStatus[data.secret].push( socket.id);
      }
      debug( userStatus);
    });
    // 在Cache加上，每個User的socket
    socket.on( 'msgIn', function (data) {
      debug(data);
      if ( data && data.target && data.msg){
        var target = userStatus[data.target];
        // socket.emit( "msgOut", data);
        for (var i = 0, imax = target.length; i < imax; i+=1){
          debug( target[i], userStatus, data.msg);
          io.to([target[i]]).emit( "msgOut", { from: data.from, msg: data.msg});
        }
      }
    });
    socket.on( 'disconnect', function (){
      debug( 'user: ' + socket.id + ' leave');
    });
  });
};
