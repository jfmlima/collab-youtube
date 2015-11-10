/**
 * Created by jorgelima on 10/26/15.
 */

angular.module('collabYoutube.controllers', [])

    .controller('mainController', function($scope, $window, $http, $socket, $session, $collab, $uibModal, $log) {
        $scope.formData = {};

        $collab.join();
        $collab.update();

        $scope.logout = function()
        {
            $session.setUser(null);
        }


        $scope.animationsEnabled = true;

        $scope.joinRoom = function(size){

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

    .controller('roomController', function($scope, $collab, $routeParams, $socket, $sce, $room) {
        $scope.formData = {};

        var room_id = $routeParams.id;

        $collab.updateRoomUsers(room_id);



        $scope.player = false;

        $scope.ok = function(){
            $scope.theBestVideo = 'sMKoNBRZM1M';
            $scope.videoframe = $sce.trustAsHtml("<iframe class='embed-responsive-item ng-isolate-scope' video-id='theBestVideo' id='unique-youtube-embed-id-1' frameborder='0' allowfullscreen='1' title='YouTube video player' width='640' height='390' src=https://youtube.com/embed/" + $scope.video_url + "></iframe>");
            $scope.deliberatelyTrustDangerousSnippet = function() {
                return $sce.trustAsHtml($scope.videoframe);
            };
            $scope.player = true;

            $collab.setReady(room_id, $scope.video_url);

        }

        $socket.on("ready", function(data){
            console.log(data);
            $scope.videoframe = $sce.trustAsHtml("<iframe class='embed-responsive-item ng-isolate-scope' video-id='theBestVideo' id='unique-youtube-embed-id-1' frameborder='0' allowfullscreen='1' title='YouTube video player' width='640' height='390' src=https://youtube.com/embed/" + data + "></iframe>");
            $scope.deliberatelyTrustDangerousSnippet = function() {
                return $sce.trustAsHtml($scope.videoframe);
            };
            $scope.player = true;
        })




    })

    .controller('joinRoomController', function ($scope, $socket, $location, $uibModalInstance) {




        $scope.ok = function () {
            var room_id = $scope.room_id;

            console.log(room_id);

            $socket.emit("roomExists", room_id, function(error, message){
                console.log("exists: " + message);
                if (message){

                    $socket.emit("joinRoom", room_id)
                    $location.url("/room/" + room_id);
                }
                else{
                    console.log("Room doesn't exists.")
                }
            })
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    })

    .controller('createRoomController', function ($scope, $socket, $session, $uibModalInstance, $collab, $location, $room) {

        $scope.ok = function () {

            console.log($scope.room_name);

            $collab.createRoom($scope.room_name);

            $session.setOwner(true);

            $socket.on('roomCreation', function(data){
                $location.url("/room/" + data);
            })
            $socket.on("updateRoom", function(data){
                console.log(data);
                $socket.emit("retrieveUserNames", data.id, function(error, message){
                    $room.updateViewers(message);
                })
            })


        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    })

    .controller('loginController', function($scope, $window, $http, $socket) {
        $scope.formData = {};


    });