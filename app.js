"use strict";
global.db;
var debug = require('debug')('dev:app.js');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
// var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var http = require('http');
var app = express();
var server = http.createServer(app);
var io = require('socket.io')(server);
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var stylus = require("stylus");
var nib = require("nib");
var web = require('./routes/web');
var api = require('./routes/api');
var passport = require("passport");
var helmet = require("helmet");
require(__dirname + '/libs/socketIO').IO(io);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use( helmet());
// uncomment after placing your favicon in /public
app.use(favicon(path.join( __dirname, 'public/images', 'favicon.ico')));
// app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
// app.middleware(__dirname + '/public');
if ( process.env.DEBUG && process.env.DEBUG.match(/dev/g )){
  app.use( '/s',stylus.middleware({
    src: __dirname + '/stylus',
    dest: __dirname + '/public/css',
    compile: compile
  }));
}

app.use('/s', express.static(__dirname + '/public'));
function compile(str, path) {
  return stylus(str)
    .set('filename', path)
    // .set('compress', true)
    .use(nib());
}

app.use(session({
  store: new MongoStore({url: conf.mongodb}),
  resave: true,
  saveUninitialized: true,
  secret: 'rubyANdJohnny',
  cookie: { maxAge: 1000 * 60 * 60 * 24 },
}));

app.use(passport.initialize());
app.use(passport.session());

debug("app.js load");

app.use(function ( req, res, next){
  var _render = res.render;
  res.render = function(view, opts, callback) {
    if (!view) {
      return res.send('no such view', 500);
    }

    if (!opts) {
      opts = {};
    }

    if ( process.env.NODE_CHAT && process.env.NODE_CHAT === "production" ) {
      opts.env = "production";
    } else {
      opts.env = "dev";
    }

    var protocol = "http";
    opts.serverInfo = {
      IO: protocol + "://" + conf.host + ":" + ( opts.env === "production" ? 80 : conf.port)
    };
    // User
    // if (req.session.user) {
    //   opts.user = {
    //     id: req.session.user._id,
    //     name: req.session.user.name,
    //     username: req.session.user.email,
    //     hasPass: req.session.user.password ? true : false,
    //     emailHash: require('crypto').createHash('md5').update( req.session.user.email).digest('hex')
    //   };
    // }
    
    _render.call(res, view, opts, callback);
  };

  next();

});

app.use('/api', api);
app.use('/', web);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = { app: app, server: server};
