var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var http = require('http');
var port = 3016;

var sqlite3 = require('sqlite3').verbose(),
    db = new sqlite3.Database('cozy.db');

var routes = require('./routes/index');
var users = require('./routes/users');
var bookmarks = require('./routes/bookmarks'); 

// Socket
var socket_io = require( "socket.io" );

// Express
var app = express();

// Socket.io
var io = socket_io();
app.io = io;

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

/*var httpServer = http.Server(app);
httpServer.listen(port, function(){
    console.log("server listening on port", port);
});*/

// io = require('socket.io').listen(httpServer);
// io.use(sharedsession(session));
/*io.on('connection', function(socket){
    console.log("connected");
    // socket.emit("greetings", {msg:"hello"});
    // socket.on("something", function(data){
    //     console.log("client["+socket.handshake.session.myCustomData.userID+"] sent data: " + data);
    // })
    socket.emit('message', { title: 'welcome to the chat' });
    socket.on('send', function (data) {
        console.log("send ",data);
        io.sockets.emit('message', data);
    });
});*/

var connectionsArray = [],POLLING_INTERVAL=3000;

var pollingLoop = function () {
    console.log('pollingLoop');
    // Make the database query
    /*var query = connection.query('SELECT * FROM users'),
        users = []; // this array will contain the result of our db query

    // set up the query listeners
    query
    .on('error', function(err) {
        // Handle error, and 'end' event will be emitted after this as well
        console.log( err );
        updateSockets( err );
        
    })
    .on('result', function( user ) {
        // it fills our array looping on each user row inside the db
        users.push( user );
    })
    .on('end',function(){
        // loop on itself only if there are sockets still connected
        if(connectionsArray.length) {
            pollingTimer = setTimeout( pollingLoop, POLLING_INTERVAL );
            // message: text, url: url.value
            updateSockets({users:users});
        }
    });*/

    db.all('SELECT * FROM bookmarks ORDER BY id', function(err, row) {
      if(err !== null) {
        // Express handles errors via its next function.
        // It will call the next operation layer (middleware),
        // which is by default one that handles errors.
        next(err);
      }else {
        console.log(row);
        /*res.render('bookmarks/index', {title: 'My Bookmarks',bookmarks: row}, function(err, html) {
          res.send(200, html);
        });*/
        if(connectionsArray.length) {
            pollingTimer = setTimeout( pollingLoop, POLLING_INTERVAL );
            // {title: text, url: url.value
            updateSockets(row);
        }
      }
    });
};


// create a new websocket connection to keep the content updated without any AJAX request
io.on('connection', function(socket){
    console.log('Number of connections:' + connectionsArray.length);
    // start the polling loop only if at least there is one user connected
    if (connectionsArray.length) {
        pollingLoop();
    }
    socket.on('disconnect', function () {
        var socketIndex = connectionsArray.indexOf( socket );
        console.log('socket = ' + socketIndex + ' disconnected');
        if (socketIndex >= 0) {
            connectionsArray.splice( socketIndex, 1 );
        }
    });
    /*socket.on('send', function (data) {
        // console.log("send ",data);
        // io.sockets.emit('message', data);
        var title = data.title;
        var url = data.url;
        var sqlRequest = "INSERT INTO 'bookmarks' (title, url) " +
                     "VALUES('" + title + "', '" + url + "')"
        db.run(sqlRequest, function(err) {
          if(err !== null) {
            next(err);
          }else {
            // res.redirect('/bookmarks');
            console.log("sent data saved",data);
            sendDataToClient();
          }
        });
    });*/
    console.log( 'A new socket is connected!' );
    connectionsArray.push( socket );
});

var updateSockets = function ( data ) {
    // store the time of the latest update
    data.time = new Date();
    // send new data to all the sockets connected
    connectionsArray.forEach(function( tmpSocket ){
        // 'message', { title: 'welcome to the chat' }
        // tmpSocket.volatile.emit( 'notification' , data );
        tmpSocket.volatile.emit( 'message' , data );
    });
};

var sendDataToClient = function(){
    db.all('SELECT * FROM bookmarks ORDER BY id', function(err, row) {
      if(err !== null) {
        // Express handles errors via its next function.
        // It will call the next operation layer (middleware),
        // which is by default one that handles errors.
        next(err);
      }else {
        console.log(row);
        // data.time = new Date();
        // send new data to all the sockets connected
        connectionsArray.forEach(function( tmpSocket ){
            // 'message', { title: 'welcome to the chat' }
            // tmpSocket.volatile.emit( 'notification' , data );
            tmpSocket.volatile.emit( 'message' , row );
        });
      }
    });
};

module.exports = app;
