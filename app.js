var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var mongoose = require('mongoose');

var http = require('http');
var debug = require('debug')('collabYoutube:server');

var passport = require('passport');
var flash    = require('connect-flash');
var cors = require('cors');
var uuid = require('node-uuid');

var routes = require('./routes/');
//var users = require('/routes/users');

var configDB = require('./config/database.js');

// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database




var app = express();

var Room = require('./models/room.js');


/**
 * Create HTTP server.
 */

var server = http.createServer(app);

var io = require('socket.io')(server);

var port = normalizePort(process.env.PORT || '3000');



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(cors());

app.use(session({
  secret: 'thatrealprotectedsecret',
  saveUninitialized: true,
  resave: true
})); // session

app.use(logger('dev'));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


if (app.get('env') === 'production') {
  session.cookie.secure = true // serve secure cookies
}
//app.get('*', routes.index);

require('./routes/routes.js')(app, passport);



require('./config/passport')(passport);


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

io.sockets.on('connection', function(clientSocket){
  console.log("connected");


  clientSocket.on('join', function (name) {
    roomID = null;

    console.log(name);
    people[clientSocket.id] = {
      "name": name,
      "room": roomID
    };

    clientSocket.emit("update", "You have sucessfully connected to the server")

    io.sockets.emit("update", people[clientSocket.id].name + " is online.");
    io.sockets.emit("update-people", people);

    clientSocket.emit("roomList", {rooms: rooms});

    clients.push(clientSocket);


  });

  clientSocket.on('createRoom', function (name) {

    if(people[clientSocket.id].room == null){
      var id = uuid.v4();
      var room = new Room(name, id, clientSocket.id);
      rooms[id] = room;
      io.sockets.emit("roomList", {rooms: rooms});

      clientSocket.room = name;
      people[clientSocket.id].room = name;
      clientSocket.join(clientSocket.room);
      room.addPerson(clientSocket.id);
      clientSocket.emit("roomCreation", id);
      clientSocket.emit("updateRoom", {id: id, room: rooms[id]});
    }
    else{
      io.sockets.emit("update", "Sorry, you can only create one room");
    }

  });

  clientSocket.on('joinRoom', function (id) {

    var room = rooms[id];

    if(clientSocket.id == room.owner){
      clientSocket.emit("update", "You are the owner, and already joined this room");
    }
    else{
      room.people.contains(clientSocket.id, function(found){
        if(found){
          clientSocket.emit("update", "You have already joined this room");
        }
        else{
          if(people[clientSocket.id].inroom !== null){
            clientSocket.emit("update", "You are already in one room (" + rooms[people[clientSocket.id].inroom].name+"), please leave it first to join another room.");
          }
          else {
            room.addPerson(clientSocket.id);
            people[clientSocket.id].inroom = id;
            clientSocket.room = room.name;
            clientSocket.join(clientSocket.room); //add person to the room
            user = people[clientSocket.id];
            io.sockets.in(clientSocket.room).emit("update", user.name + " has connected to " + room.name + " room.");
            clientSocket.emit("update", "Welcome to " + room.name + ".");
            clientSocket.emit("sendRoomID", {id: id});
          }
        }
      });
    }
  });

  clientSocket.on('retrieveUserNames', function (id, callback) {

    var room = rooms[id];
    var names = [];

    console.log(room);
    room.people.forEach(function(user){
      names.push(people[user].name);
      console.log(people[user].name );

    })

    callback("error", names);

  });


  counter++;

  console.log("connections: ", counter);

  clientSocket.on('disconnect', function(){
    counter--;
    console.log("disconnected");
    console.log("connections: ", counter);
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
