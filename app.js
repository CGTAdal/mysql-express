var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mysql = require("mysql");

var pool = mysql.createPool({
    connectionLimit   :   100,
    host              :   'localhost',
    user              :   'root',
    password          :   'root',
    database          :   'poolapp',
    debug             :   false
});

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


var connectionsArray = [],POLLING_INTERVAL = 1000;
var pollingLoop = function () {
    console.log('pollingLoop');

    pool.getConnection(function(err,connection){
        if (err) {
            connection.release();
            // if (err) throw err;
            pollingTimer = setTimeout( pollingLoop, POLLING_INTERVAL );
            return;
        }
        var datetime = '2015-08-22 15:09:18';
        connection.query("SELECT * FROM geodata WHERE created_on >= '"+datetime+"'", function(err, rows, fields) {
            // if (err) throw err;
            if(!err){
                // console.log('The data: ', rows);
                if(connectionsArray.length) {
                    pollingTimer = setTimeout( pollingLoop, POLLING_INTERVAL );
                    // {title: text, url: url.value
                    updateSockets(rows);
                }
            }
        });
        connection.on('error', function(err) {
            // if (err) throw err;
            pollingTimer = setTimeout( pollingLoop, POLLING_INTERVAL );
            return;
        });
    });
};


// create a new websocket connection to keep the content updated without any AJAX request
io.on('connection', function(socket){
    console.log('Number of connections:' + connectionsArray.length);
    // start the polling loop only if at least there is one user connected
    if (!connectionsArray.length) {
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
        var device_id = data.device_id;
        var desc = data.desc;

        pool.getConnection(function(err,connection){
            if (err) {
                connection.release();
                callback(false);
                return;
            }
            connection.query("INSERT INTO `poolapp`.`geodata` (`id`, `device_id`, `desc`, `lat`, `long`, `created_on`) VALUES (NULL,"+device_id+", '"+desc+"', GeomFromText(NULL), GeomFromText(NULL), CURRENT_TIMESTAMP)",function(err,rows){
                connection.release();
                if(!err) {
                    console.log("sent data saved",data);
                    sendDataToClient();
                }
            });
        });
    });*/
    console.log( 'A new socket is connected!' );
    connectionsArray.push( socket );
    // console.log(socket.nsp);
});

var updateSockets = function ( data ) {
    // store the time of the latest update
    data.time = new Date();
    // send new data to all the sockets connected
    connectionsArray.forEach(function( tmpSocket ){
        // 'message', { title: 'welcome to the chat' }
        // tmpSocket.volatile.emit( 'notification' , data );
        tmpSocket.emit('message',data);
    });
};

var sendDataToClient = function(){
    pool.getConnection(function(err,connection){
        if (err) {
            connection.release();
            // throw err;
            return;
        }
        var datetime = '2015-08-22 15:09:18';
        connection.query("SELECT * FROM geodata WHERE created_on >= '"+datetime+"'", function(err, rows, fields) {
            // if (err) throw err;
            console.log('The solution is: ', rows);
            updateSockets(rows);
        });
        connection.on('error', function(err) {
            // if (err) throw err;
            return;
        });
    });
};

module.exports = app;
