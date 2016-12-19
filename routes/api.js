"use strict";
var debug = require("debug")("dev:api.js");
var express = require('express');
var router = express.Router();

router.get( '/getMessages', function(req, res) {
  debug( req.session.user + "want to get" );
  debug( req.body);
  res.send();
});

module.exports = router;
