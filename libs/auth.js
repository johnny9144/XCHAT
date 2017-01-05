"use strict";
var self = module.exports;
var crypto = require('crypto');
var debug = require('debug')('dev');
self.login = function ( username, pw, next) {
  var md5 = crypto.createHash('md5');
  pw += 'JOhnnY';
  md5.update(pw);
  pw = md5.digest('hex');
  db.collection("user").findOne({ email: username, pw: pw}, function ( err, obj){
    debug("username: "+ username);
    if (obj){
      return next(obj);
    }
    return next(false);
  });
};
