/**
 * Created by jorgelima on 10/26/15.
 */

angular.module('collabYoutube.controllers', [])

    .controller('mainController', function($scope, $window, $http, $socket, $session, $collab) {
        $scope.formData = {};

        $socket.on("connect", function(){
            console.log("connnected")
        });

        $scope.logout = function()
        {
            $session.setUser(null);
        }

        $scope.joinRoom = function(){
            $collab.join();
        }


    })

    .controller('loginController', function($scope, $window, $http, $socket) {
        $scope.formData = {};


    });