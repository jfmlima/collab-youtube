/* global process*/
/* global __dirname*/

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var cookieSession = require('cookie-session')
var mongoose = require('mongoose');
var http = require('http');
var debug = require('debug')('collabYoutube:server');
var passport = require('passport');
var flash = require('connect-flash');
var cors = require('cors');
var comm = require('./config/comm.js');
var configDB = require('./config/database.js');

// configuration ===============================================================

mongoose.connect(configDB.url || process.env.MONGOLAB_URI); // connect to our database

var app = express();

/**
 * Create HTTP server.
 */

var server = http.createServer(app);
var io = require('socket.io')(server);
var port = normalizePort(process.env.PORT || '3000');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(cors());

app.set('trust proxy', 1) // trust first proxy

app.use(cookieSession({
    name: 'session',
    keys: ['key1', 'key2']
}));


app.use(logger('dev'));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

require('./routes/routes.js')(app, passport);

require('./config/passport')(passport);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

app.set('port', port);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

var counter = 0;
var people = {};
var rooms = {};
var clients = [];

io.sockets.on('connection', function (clientSocket) {
        
    clientSocket.on('join', function (name) {
        comm.join(io, clientSocket, name, people, rooms, clients);
    });

    clientSocket.on('createRoom', function (name) {
        comm.createRoom(io, clientSocket, name, people, rooms, clients);
    });

    clientSocket.on('joinRoom', function (id) {
        comm.joinRoom(io, clientSocket, id, people, rooms);
    });
    
    clientSocket.on("getRoomName", function (id, callback) {
        comm.getRoomName(rooms, id, callback);
    });

    clientSocket.on("leaveRoom", function (id) {
        comm.leaveRoom(io, clientSocket, id, people, rooms, clients);
    });

    clientSocket.on('readyState', function (id, callback) {
        comm.readyState(id, callback, rooms, io);
    });

    clientSocket.on('retrieveUserNames', function (id, callback) {
        comm.retrieveUserNames(id, callback, rooms, people);
    });

    clientSocket.on('roomExists', function (id, callback) {
        comm.roomExists(id, callback, rooms);        
    });

    clientSocket.on('isRoomOwner', function (id, callback) {
        comm.isRoomOwner(id, callback, rooms, people, clientSocket);       
    });

    clientSocket.on('clientReady', function (id, callback) {
        comm.clientReady(id, callback, rooms, clientSocket, people, io);
    });

    clientSocket.on('playVideo', function (data, callback) {
        comm.playVideo(data, callback, rooms, clientSocket, io);
    });

    clientSocket.on('pauseVideo', function (data, callback) {
        comm.pauseVideo(data, callback, rooms, io);
    });

    counter++;

    console.log("connections: ", counter);

    clientSocket.on('disconnect', function () {
        counter--;
        setTimeout(function () {

            console.log("disconnected");
            console.log("connections: ", counter);
        }, 10000);
    });
});

module.exports = app;

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    debug('Listening on ' + bind);
}

Array.prototype.contains = function (k, callback) {
    var self = this;
    return (function check(i) {
        if (i >= self.length) {
            return callback(false);
        }
        if (self[i] === k) {
            return callback(true);
        }
        return process.nextTick(check.bind(null, i + 1));
    } (0));
};