"use strict";
global.db;
var debug = require('debug')('dev:app.js');
var express = require('express');
var path = require('path');
// var favicon = require('serve-favicon');
// var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var http = require('http');
var app = express();
var server = http.createServer(app);
var io = require('socket.io')(server);
var web = require('./routes/web');
require(__dirname + '/libs/socketIO').IO(io);
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
// app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/s', express.static(__dirname + '/public'));
app.use(session({
  store: new MongoStore({url: conf.mongodb}),
  resave: false,
  saveUninitialized: false,
  secret: 'rubyANdJohnny',
  cookie: { maxAge: 1000 * 60 * 60 * 24 },
}));
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
    opts.serverInfo = {
      IO: conf.IO.url + ":" + conf.IO.port
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
