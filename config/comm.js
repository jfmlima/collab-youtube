var uuid = require('node-uuid');
var Room = require('../models/room');

module.exports = {
    join: function (io, clientSocket, name, people, rooms, clients) {
        var roomID = null;

        console.log(name);
        people[clientSocket.id] = {
            "name": name,
            "room": roomID,
            ready: false
        };

        clientSocket.emit("update", "You have sucessfully connected to the server")
        io.sockets.emit("update", people[clientSocket.id].name + " is online.");
        io.sockets.emit("update-people", people);
        clientSocket.emit("roomList", { rooms: rooms });
        clients.push(clientSocket);
    },

    createRoom: function (io, clientSocket, name, people, rooms) {
        if (people[clientSocket.id].room == null) {
            var id = uuid.v4();
            var room = new Room(name, id, clientSocket.id);
            rooms[id] = room;

            io.sockets.emit("roomList", { rooms: rooms });
            clientSocket.room = name;
            people[clientSocket.id].room = name;
            people[clientSocket.id].ready = true;
            clientSocket.join(clientSocket.room);
            room.addPerson(clientSocket.id);
            clientSocket.emit("roomCreation", id);
            clientSocket.emit("updateRoom", { id: id, room: rooms[id] });
        }
        else {
            io.sockets.emit("update", "Sorry, you can only create one room");
        }
    },

    joinRoom: function (io, clientSocket, id, people, rooms) {
        var room = rooms[id];

        if (clientSocket.id == room.owner) {
            clientSocket.emit("update", "You are the owner, and already joined this room");
        }
        else {
            room.people.contains(clientSocket.id, function (found) {
                if (found) {
                    clientSocket.emit("update", "You have already joined this room");
                }
                else {
                    if (people[clientSocket.id].inroom !== undefined) {
                        clientSocket.emit("update", "You are already in one room (" + rooms[people[clientSocket.id].inroom].name + "), please leave it first to join another room.");
                    }
                    else {
                        room.addPerson(clientSocket.id);
                        people[clientSocket.id].inroom = id;
                        clientSocket.room = room.name;
                        clientSocket.join(clientSocket.room); //add person to the room
                        var user = people[clientSocket.id];
                        io.sockets.in(clientSocket.room).emit("update", user.name + " has connected to " + room.name + " room.");
                        io.sockets.in(clientSocket.room).emit("clientJoin", user.name + " has connected to " + room.name + " room.");
                        clientSocket.emit("update", "Welcome to " + room.name + ".");
                        clientSocket.emit("sendRoomID", { id: id });
                    }
                }
            });
        }
    },

    getRoomName: function (rooms, id, callback) {
        var room = rooms[id];
        callback("name", room.name);
    },

    leaveRoom: function (io, clientSocket, id, people, rooms, clients) {
        var room = rooms[id];
        if (clientSocket.id === room.owner) {
            var i = 0;
            while (i < clients.length) {
                if (clients[i].id == room.people[i]) {
                    people[clients[i].id].inroom = null;
                    people[clients[i].id].room = null;
                    people[clients[i].id].ready = false;
                    clients[i].leave(room.name);
                }
                ++i;
            }
            delete rooms[id];
            people[clientSocket.id].room = null;
            people[clientSocket.id].ready = false;
            people[room.owner].owns = null; //reset the owns object to null so new room can be added
            io.sockets.emit("roomList", { rooms: rooms });
            io.sockets.in(clientSocket.room).emit("userLeaveRoom", people[clientSocket.id].name);
            io.sockets.emit("update", "The owner (" + people[clientSocket.id].name + ") is leaving the room. The room is removed.");
        } else {
            room.people.contains(clientSocket.id, function (found) {
                if (found) { //make sure that the client is in fact part of this room
                    var personIndex = room.people.indexOf(clientSocket.id);
                    room.people.splice(personIndex, 1);
                    people[clientSocket.id].room = null;
                    people[clientSocket.id].ready = false;
                    io.sockets.in(clientSocket.room).emit("userLeaveRoom", people[clientSocket.id].name);
                    io.sockets.emit("update", people[clientSocket.id].name + " has left the room.");
                    clientSocket.leave(room.name);
                }
            });
        }
    },

    readyState: function (id, callback, rooms, io) {
        var name = rooms[id.room].name;
        io.sockets.in(name).emit("ready", id.url);
    },

    retrieveUserNames: function (id, callback, rooms, people) {
        var room = rooms[id];
        var names = [];

        room.people.forEach(function (user) {
            names.push({ name: people[user].name, ready: people[user].ready });
        })
        callback("error", names);
    },

    roomExists: function (id, callback, rooms) {
        var room = rooms[id];

        if (room !== undefined) {
            callback("error", true);
        }
        else
            callback("error", false);
    },

    isRoomOwner: function (id, callback, rooms, people, clientSocket) {
        var room = rooms[id.room];

        if (room && room.owner == clientSocket.id) {
            callback("error", true);
        }
        else
            callback("error", false);
    },
    
    clientReady:function(id, callback, rooms, clientSocket, people, io){
        var name = rooms[id].name;

        people[clientSocket.id].ready = true;
        io.sockets.in(name).emit("clientIsReady", people[clientSocket.id].name);
    },
    
    playVideo: function(data, callback, rooms, clientSocket, io){
        var video_url = data.url;
        var name = rooms[data.room].name

        io.sockets.in(name).emit("play", video_url);
    },
    
    pauseVideo: function(data, callback, rooms, io){
        var video_url = data.url;
        var name = rooms[data.room].name

        io.sockets.in(name).emit("pause", video_url);
    }
}