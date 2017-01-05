"use strict";
var debug = require("debug")("dev:socketIO");
var async = require("async");
var self = module.exports;
var userStatus = {};
var room = [];

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
      debug( data);
      if ( data && data.target && data.msg){
        var target = userStatus[data.target];
        async.series([
          function (done) {
            if ( room && ( room.indexOf( data.target+data.from) > -1 || room.indexOf( data.from+data.target) > -1)){          
              debug("got rooms");
              return done();
            }
            db.collection("messages").update( {
              $or: [
                { a: data.target, b: data.from},
                { b: data.target, a: data.from}
              ]
            }, {
              $set: { a: data.target, b: data.from },
            }, {
              upsert: true,
              multi: false
            }, function ( err, result) {
              if ( err) {
                return debug( err);
              }
              room.push(data.target+data.from);
              debug(room);
              return done();
            });
          }
        ], function ( err) {
          db.collection( "messages").update( {
            $or: [
              { a: data.target, b: data.from},
              { b: data.target, a: data.from}
            ]
          }, {
            $push: { 
              talk: {
                date: new Date(), 
                from: data.from, 
                content: data.msg
              }
            }
          }, {
            upsert: false,
            multi: false
          }, function ( err, result){
            if ( err) {
              debug( err);
            }
          });

          if ( target && target.length > 0) {
            async.each( target, function ( addr, next) {
              try {
                io.to( addr).emit( "msgOut", { from: data.from, msg: data.msg});
              } catch(e) {
                // 拿掉無法傳送的位置
                userStatus[data.target].splice( userStatus[data.target].indexOf( userStatus[data.target][addr]));
                debug("fail when send msg: " + e);
              }
              next();
            }, function ( err) {
              debug( "msg send");
            });
          }
          // for (var i = 0, imax = target.length; i < imax; i+=1){
          //   try {
          //     io.to(target[i]).emit( "msgOut", { from: data.from, msg: data.msg});
          //   } catch(e) {
          //     拿掉無法傳送的位置
          //     userStatus[data.target].splice(userStatus[data.target].indexOf( userStatus[data.target][i]));
          //     debug("fail when send msg: " + e);
          //   }
          // }
        });
      } else {
        debug( "error format");
      }
    });
    socket.on( 'disconnect', function (){
      // 之後可能想辦法去掉userStatus裡面的，並且去掉已經斷線的位置
      debug( 'user: ' + socket.id + ' leave');
    });
  });
};
