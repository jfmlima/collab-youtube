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



        $scope.items = ['item1', 'item2', 'item3'];

        $scope.animationsEnabled = true;

        $scope.joinRoom = function(size){

            $collab.join();

            var modalInstance = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: '/partials/joinModal',
                controller: 'ModalInstanceCtrl',
                size: size,
                resolve: {
                    items: function () {
                        return $scope.items;
                    }
                }
            });

            modalInstance.result.then(function (selectedItem) {
                $scope.selected = selectedItem;
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        };


    })

    .controller('ModalInstanceCtrl', function ($scope, $uibModalInstance, items) {

        $scope.items = items;
        $scope.selected = {
            item: $scope.items[0]
        };

        $scope.ok = function () {
            $uibModalInstance.close($scope.selected.item);
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    })

    .controller('loginController', function($scope, $window, $http, $socket) {
        $scope.formData = {};


    });