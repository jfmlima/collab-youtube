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


    .service('$collab', function($rootScope, $socket, $session){

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

    })