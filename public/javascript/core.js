// public/core.js
angular.module('collabYoutube', ['collabYoutube.controllers', 'collabYoutube.services', 'ui.bootstrap', 'ngRoute', 'btford.socket-io'])

    .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
        $routeProvider.
            when('/', {
                templateUrl: '/partials/index',
                controller: 'mainController'
            }).
            /*when('/addPost', {
                templateUrl: 'partials/addPost',
                controller: AddPostCtrl
            }).
            when('/readPost/:id', {
                templateUrl: 'partials/readPost',
                controller: ReadPostCtrl
            }).
            when('/editPost/:id', {
                templateUrl: 'partials/editPost',
                controller: EditPostCtrl
            }).
            when('/deletePost/:id', {
                templateUrl: 'partials/deletePost',
                controller: DeletePostCtrl
            }).*/
            otherwise({
                redirectTo: '/'
            });
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });
    }]);


