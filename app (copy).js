var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var http = require('http');

var session = require('express-session')({
        secret: "aliensAreAmongUs",
        resave: true,
        saveUninitialized: true
    });
var sharedsession = require('express-socket.io-session');

var sqlite3 = require('sqlite3').verbose(),
    db = new sqlite3.Database('cozy.db');

var routes = require('./routes/index');
var users = require('./routes/users');
var bookmarks = require('./routes/bookmarks'); 

var socket_io = require( "socket.io" );

// Express
var app = express();

// Socket.io
// var io = socket_io();
// app.io = io;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);
app.use('/bookmarks', bookmarks);

// Database initialization
/***************************************************/
db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='bookmarks'",
       function(err, rows) {
  if(err !== null) {
    console.log(err);
  }
  else if(rows === undefined) {
    db.run('CREATE TABLE "bookmarks" ' +
           '("id" INTEGER PRIMARY KEY AUTOINCREMENT, ' +
           '"title" VARCHAR(255), ' +
           'url VARCHAR(255))', function(err) {
      if(err !== null) {
        console.log(err);
      }
      else {
        console.log("SQL Table 'bookmarks' initialized.");
      }
    });
  }
  else {
    console.log("SQL Table 'bookmarks' already initialized.");
  }
});
/***************************************************/

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;

/*app.io.use(sharedsession(session));
app.io.on('connection', function(socket){
    console.log("connected");
    socket.emit("greetings", {msg:"hello"});
    socket.on("something", function(data){
        console.log("client["+socket.handshake.session.myCustomData.userID+"] sent data: " + data);
    })
});*/

