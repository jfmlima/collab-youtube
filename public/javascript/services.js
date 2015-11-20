/**
 * Created by jorgelima on 10/26/15.
 */

angular.module('collabYoutube.services', [])

    .factory('$socket', function (socketFactory) {
        return socketFactory();
    })

    .service('$session', function(){
        var user_;
        var owner = false;

        this.setUser = function(user){
            user_ = user;
        }

        this.getUser = function(){
            if(user_ != null){
                return user_;
            }
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
            var name = user.facebook.name;

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

        this.updateRoomUsers = function(room_id){
            $socket.emit("retrieveUserNames", room_id, function(error, message){
                $room.updateViewers(message);
                $rootScope.viewers = $room.getViewers();
            })
        }

        this.isRoomOwner = function(room_id, callback){
            $socket.emit("isRoomOwner", room_id, function(error, message){
                callback(message);
            })
        }

        this.setReady = function(room_id, video_url){
            $socket.emit("readyState", {room: room_id, url: video_url});
        }

        this.playVideo = function(room_id, video_url){
            $socket.emit("playVideo", {room: room_id, url: video_url});
        }
        this.pauseVideo = function(room_id, video_url){
            $socket.emit("pauseVideo", {room: room_id, url: video_url});
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