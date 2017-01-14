"use strict";
var self = module.exports;
var ObjectId = require("mongodb").ObjectID;
var debug = require("debug")("dev:libs:chat");

debug( "load");
self.getMessages = function ( id, from, count, next) {
  debug( id, from, count);
  db.collection("messages").aggregate([
    { $match: { "_id" : ObjectId( id)}},
    { $unwind: "$talk"},
    { $project : { date: "$talk.date", from: "$talk.from", content: "$talk.content", type: "$talk.type" }},
    { $sort: { "date": 1}},
    { $skip: parseInt( from, 10) },
    { $limit: parseInt( count, 10) }
  ]).toArray( function ( err, docs) {
    if ( err) {
      return next( err);
    }
    next( null, docs);
  });
};
