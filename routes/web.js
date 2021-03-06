"use strict";
var debug = require("debug")("dev:web.js");
var express = require('express');
var router = express.Router();
var auth = require( __dirname + '/../libs/auth');

debug( "load");
router.get( '/login', function ( req, res){
  if ( req.session && req.session.user) {
    return res.render( 'chat', { user: req.session.user });
  }
  return res.render( 'member/login');
});

router.get( '/', function ( req, res){
  if ( req.session && req.session.user) {
    return res.render( 'chat', { user: req.session.user });
  }
  return res.render( 'member/login');
});

router.get( '/logout', function ( req, res) {
  if ( req.session && req.session.user) {
    delete req.session.user;
  }
  return res.render( 'member/login');
});

router.post( '/login', function ( req, res){
  var data = req.body;
  auth.login( data.username, data.password, function ( doc) {
    if ( !doc) {
      return res.send({ code: 403, msg: "fail"});
    }

    req.session.user = {
      _id: doc._id.toString(),
      email: doc.email,
      name: doc.name,
      friends: doc.friends
    };

    return res.send({ code: 200, data: doc});
  });
});

router.get( "/signup", function ( req, res) {
  return res.render( 'member/signup');
});

router.get( '/home', lr, function(req, res) {
  return res.render( 'chat', { user: req.session.user });
});

module.exports = router;

function lr(req, res, next){
  if(req.session && req.session.user){
    return next();
  }
  return res.redirect("/login");
}
