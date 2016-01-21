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

    .controller('roomController', function($scope, $collab, $routeParams, $session, $socket, isOwner, $location, $rootScope, $q) {

        var room_id = $routeParams.id;

        var update_users = function () {

            $collab.updateRoomUsers(room_id, function (callback) {
                console.log("call: " + callback);
                $scope.viewers = callback;
            });
        }

        $collab.getRoomName(room_id, function(callback){
            $scope.roomName = callback;
        })

        $scope.formData = {};
        $scope.video_url = null;
        $scope.isOwner = isOwner;
        var user = $session.getUser();

        if (user.facebook) {

            $scope.profilePic = 'http://graph.facebook.com/' + user.facebook.id + '/picture?width=270&height=270';
            $scope.userName = user.facebook.name;
        }
        else if(user.google)
        {

        }

        update_users();

        $scope.playerSettings = {
            player: null,
            vars: {
                controls: 0,
                disablekb: 0
            }
        }

        $scope.myStyle = "http://img.youtube.com/vi/" + $scope.video_url + "/0.jpg"
        $scope.player = false;

        $scope.ok = function(video_url){
            console.log("ID:AD " + video_url)
            $scope.video_url = video_url;
            $scope.theBestVideo = $scope.video_url;
            $scope.player = true;
            $collab.setVideoReady(room_id, $scope.video_url);
        }

        $scope.play = function(){
            $collab.playVideo(room_id, $scope.video_url);
            console.log($scope.playerSettings.player);
            $scope.playerSettings.player.playVideo();

        }

        $rootScope.$on('$routeChangeStart', function () {
            $collab.join();
        });

        $scope.pause = function(){
            $collab.pauseVideo(room_id, $scope.video_url);
            $scope.playerSettings.player.pauseVideo();
        }

        $scope.setReady = function(){
            console.log("Im READYYYY in " + room_id);
            $collab.clientReady(room_id);
        }

        $socket.on("ready", function(data){
            console.log(data);
            $scope.theBestVideo = data;
            $scope.myStyle = "http://img.youtube.com/vi/" + data + "/0.jpg"
            $scope.preview = true;
        })

        $socket.on("clientJoin", function(data){
            update_users();
        })

        $socket.on("clientIsReady", function(data){
            update_users();
        })

        $socket.on("userLeaveRoom", function(data){
            update_users();
        })

        $scope.exit = function(){
            $collab.leaveRoom(room_id);
            $location.path( "/" );
        }

        $socket.on("play", function(url){
            $scope.theBestVideo = url;
            $scope.preview = false;
            $scope.player = true;
            if($scope.playerSettings.player)
                $scope.playerSettings.player.playVideo()
            else {
                $scope.$on('youtube.player.ready', function ($event, player) {
                    console.log("player ready");
                    player.playVideo();
                });
            }
        })

        $socket.on("pause", function(url){
            $scope.playerSettings.player.pauseVideo();
        })
    })

    .controller('joinRoomController', function ($scope, $socket, $location, $uibModalInstance) {

        $scope.ok = function () {
            var room_id = $scope.room_id;

            console.log(room_id);

            $socket.emit("roomExists", room_id, function(error, message){  //TODO  change this to service and use callback to retrieve the value
                console.log("exists: " + message);
                if (message){

                    $socket.emit("joinRoom", room_id)
                    $location.url("/room/" + room_id);
                }
                else{
                    console.log("Room doesn't exists.")
                }
            })
            $uibModalInstance.dismiss('cancel');
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
            $uibModalInstance.dismiss('cancel');

        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    })

    .controller('loginController', function($scope, $window, $http, $socket) {
        $scope.formData = {};

    })

