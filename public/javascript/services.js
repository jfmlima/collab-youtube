/**
 * Created by jorgelima on 10/26/15.
 */

angular.module('collabYoutube.services', [])

    .factory('$socket', function (socketFactory) {
        return socketFactory();
    })

    .service('$session', function($cookies){
        var user_;
        var owner = false;

        this.setUser = function(user){
            $cookies.putObject("user", user);
            user_ = user;
        }

        this.getUser = function(){
            var user = $cookies.getObject("user");
            console.log(user);
            /*if(user_ != null){
                return user_;
            }
            else */if(user != null)
                return user;
            else
            return null;
        }

        this.setOwner = function(value){
            owner = value;
        }

        this.isRoomOwner = function(){
            return owner;
        }
    })

    .service("$room", function(){

        var viewers;

        this.updateViewers = function(viewers_){
            viewers = viewers_;
        }

        this.getViewers = function(){
            return viewers;
        }
    })


    .service('$collab', function($rootScope, $socket, $session, $room){

        this.join = function(){
            var user = $session.getUser();
            if(user.facebook)
                var name = user.facebook.name;
            else if(user.google)
                var name = user.google.name;

            $socket.emit('join', name);

        }

        this.update = function(){
            $socket.on('update', function(data){
                console.log(data);
            });

        }


        this.createRoom = function(name){

            $socket.emit('createRoom', name);

        }

        this.leaveRoom = function(name){

            $socket.emit('leaveRoom', name);

        }

        this.updateRoomUsers = function(room_id, callback){
            $socket.emit("retrieveUserNames", room_id, function(error, message){
                $room.updateViewers(message);
                /*$rootScope.viewers = $room.getViewers();
                console.log($rootScope.viewers)*/
                callback($room.getViewers());
            })
        }

        this.isRoomOwner = function(room_id, callback){
            var user = $session.getUser();      ///TODO SET USER ON COOKIE

            if(user.facebook)
                var name = user.facebook.name;
            else if(user.google)
                var name = user.google.name;

            $socket.emit("isRoomOwner", {room:room_id, name: name}, function(error, message){
                callback(message);
            })
        }

        this.getRoomName = function(room_id, callback){

            $socket.emit("getRoomName", room_id, function(error, message){
                callback(message);
            })
        }

        this.roomExists = function(room_id, callback){
            $socket.emit("roomExists", room_id, function(error, message){
                callback(message);
            })
        }

        this.setVideoReady = function(room_id, video_url){
            $socket.emit("readyState", {room: room_id, url: video_url});
        }

        this.playVideo = function(room_id, video_url){
            $socket.emit("playVideo", {room: room_id, url: video_url});
        }
        this.pauseVideo = function(room_id, video_url){
            $socket.emit("pauseVideo", {room: room_id, url: video_url});
        }

        this.clientReady = function(room_id){
            $socket.emit("clientReady", room_id);
        }

    })

    .service("$youtube", function(){

        var player;

        this.initPlayer = function(){

            player = new YT.Player('player', {
                height: '390',
                width: '640',
                videoId: 'M7lc1UVf-VE',
                events: {
                    'onReady': onPlayerReady,
                    'onStateChange': onPlayerStateChange
                }
            });
        }

    })