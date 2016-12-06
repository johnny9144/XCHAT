"use strict";
var debug = require("debug")("dev");
var express = require('express');
var router = express.Router();
var auth = require( __dirname + '/../Libs/auth');
router.get( '/login', function ( req, res){
  res.render( 'login');
});

router.post( '/login', function ( req, res){
  var data = req.body;
  auth.login( data.username, data.password, function ( doc) {
    // debug(doc);
    if ( doc){
      req.session.user = {
        _id: doc._id.toString(),
        email: doc.email,
        name: doc.name
      };
    }
    return res.send({ code: 200, data: doc});
  });
});
router.get( '/home', lr, function(req, res) {
  res.render( 'chat', { user: req.session.user});
  debug(req.session.user);
});

module.exports = router;

function lr(req, res, next){
  if(req.session && req.session.user){
    return next();
  }
  return res.redirect("/login");
}
