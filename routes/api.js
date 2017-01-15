"use strict";
var debug = require("debug")("dev:api.js");
var express = require('express');
var chat = require( __dirname + '/../libs/chat');
var router = express.Router();
var ObjectId = require("mongodb").ObjectID;

router.get( '/messages', function ( req, res) {
  var data = req.query;
  if ( !data || !data.roomId || !data.from || !data.count) {
    return res.sendStatus( 404);
  }
  chat.getMessages ( data.roomId, data.from, data.count, function ( err, docs) {
    if ( err) {
      debug( err);
      return res.sendStatus( 500);
    }
    res.send( docs);
  });
});

router.get( '/code', function ( req, res) {
  var data = req.query;
  db.collection("file").findOne({ _id: ObjectId(data.url)}, function ( err, result) {
    if ( err || !result) {
      return res.sendStatus( 500);
    }
    res.send( { type: result.type, content: result.content});
  });
});

router.post( '/sendCode', function ( req, res ) {
  var data = req.body;
  db.collection( "file").insertOne( data, function ( err) {
    if ( err) {
      return res.sendStatus( 500);
    }
    res.send( { url: data._id.toString()});
  });
});
module.exports = router;
