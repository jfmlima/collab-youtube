/**
 * Created by jorgelima on 10/26/15.
 */

angular.module('collabYoutube.controllers', [])

    .controller('mainController', function($scope, $window, $http, $socket) {
        $scope.formData = {};

        $socket.on("connect", function(){
            console.log("connnected")
        });

        $scope.facebookLogin = function()
        {
            console.log("data");
            $window.location = $window.location.protocol + "//" + $window.location.host + $window.location.pathname + "auth/facebook";
        }


    })

    .controller('loginController', function($scope, $window, $http, $socket) {
        $scope.formData = {};


    });