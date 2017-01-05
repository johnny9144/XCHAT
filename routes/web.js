"use strict";
var debug = require("debug")("dev:web.js");
var express = require('express');
var router = express.Router();
var auth = require( __dirname + '/../libs/auth');

debug( "load");
router.get( '/login', function ( req, res){
  return res.render( 'member/login');
});

router.get( '/', function ( req, res){
  return res.render( 'member/login');
});

router.post( '/login', function ( req, res){
  var data = req.body;
  auth.login( data.username, data.password, function ( doc) {
    if ( doc){
      req.session.user = {
        _id: doc._id.toString(),
        email: doc.email,
        name: doc.name,
        friends: doc.friends
      };
    }
    return res.send({ code: 200, data: doc});
  });
});

router.get( '/home', lr, function(req, res) {
  return res.render( 'chat', { user: req.session.user });
});

router.get( '/registrar', function( req, res) {
  return res.render( 'registrar');
});

router.post( '/getMessages', function ( req, res) {

});

module.exports = router;

function lr(req, res, next){
  if(req.session && req.session.user){
    return next();
  }
  return res.redirect("/login");
}
