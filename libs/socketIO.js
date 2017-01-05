"use strict";
var debug = require("debug")("dev:socketIO");
var async = require("async");
var ObjectID = require('mongodb').ObjectID;
var self = module.exports;
var userStatus = {};
var room = {};

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
      // 檢查資料格式
      if ( data && data.target && data.msg){
        var target = userStatus[data.target];
        async.waterfall([
          function (done) {
            // 檢查room裡面有沒有 room id
            if ( room && ( room[data.target+data.from] || room[data.from+data.target])){          
              debug("got rooms");
              return done( null, ObjectID( room[data.target+data.from] ? room[data.target+data.from] : room[data.from+data.target]));
            }
            // 檢查db裡面是否已經有存在 room id
            db.collection("messages").findOne( { $or: [ { a: data.target, b: data.from}, { a: data.from, b: data.target }]}, function ( err, obj) {
              if ( err) {
                return debug( err);
              }
              if ( obj) {
                room[data.target+data.from] = obj._id.toString();
                done( null, obj._id);
              } else {
                // 沒有就 create 一個
                var init = { a: data.target, b: data.from, talk: [] };
                db.collection("messages").insertOne( init, function ( err, result) {
                  if ( err) {
                    return debug( err);
                  }
                  room[data.target+data.from] = init._id.toString();
                  return done( null, init._id);
                });
              }
            });
          },
          function ( roomId, done) {
            db.collection( "messages").updateOne(
              {
                _id: roomId
              },
              {
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
                  return done( err);
                }
                done();
              }
            );
          },
          function ( done) {
            // 檢查目標有沒有連線在線上
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
                if ( err) {
                  return done( err);
                }
                done();
              });
            }
          }
        ], function ( err) {
          if ( err) {
            debug( err);
          }
          debug( "msgs sent");
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
