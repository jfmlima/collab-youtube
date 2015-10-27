/**
 * Created by jorgelima on 10/26/15.
 */

angular.module('collabYoutube.services', [])

    .factory('$socket', function (socketFactory) {
        return socketFactory();
    })

    .service('sessionService', function($socket){
        var userIsAuthenticated = false;


        this.getUserAuthenticated = function(){
            $socket.emit('authenticationRequest', function (data) {
                console.log(data);
            })
            return userIsAuthenticated;
        };
        
    })