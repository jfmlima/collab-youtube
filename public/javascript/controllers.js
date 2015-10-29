/**
 * Created by jorgelima on 10/26/15.
 */

angular.module('collabYoutube.controllers', [])

    .controller('mainController', function($scope, $window, $http, $socket, $session, $collab, $uibModal, $log) {
        $scope.formData = {};

        $socket.on("connect", function(){
            console.log("connnected")
        });

        $scope.logout = function()
        {
            $session.setUser(null);
        }


        $scope.animationsEnabled = true;

        $scope.joinRoom = function(size){

            $collab.join();
            $collab.update();

            var joinModal = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: '/partials/joinModal',
                controller: 'joinRoomController',
                size: size
            });

            joinModal.result.then(function (selectedItem) {
                $scope.selected = selectedItem;
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        };

        $scope.createRoom = function(size){

            var createModal = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: '/partials/createModal',
                controller: 'createRoomController',
                size: size
            });

            createModal.result.then(function (selectedItem) {
                $scope.selected = selectedItem;
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        };


    })

    .controller('roomController', function($scope, $window, $http, $socket) {
        $scope.formData = {};


    })

    .controller('joinRoomController', function ($scope, $uibModalInstance) {

        $scope.ok = function () {
            console.log($scope.room_id);
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    })

    .controller('createRoomController', function ($scope, $uibModalInstance) {

        $scope.ok = function () {
            console.log($scope.room_id);
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    })

    .controller('loginController', function($scope, $window, $http, $socket) {
        $scope.formData = {};


    });