/**
 * Created by jorgelima on 10/26/15.
 */

angular.module('collabYoutube.services', [])

    .factory('$socket', function (socketFactory) {
        return socketFactory();
    })

    .service('$session', function(){
        var user_;

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
    })

    .service('$collab', function($socket, $session){

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

    })