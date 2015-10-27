// public/core.js
angular.module('collabYoutube', ['collabYoutube.controllers', 'collabYoutube.services', 'ui.bootstrap', 'ngRoute', 'btford.socket-io'])

    .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
        $routeProvider.
            when('/', {
                templateUrl: '/partials/index',
                controller: 'mainController',
                access: { requiredLogin: true }
            }).
            when('/login', {
                templateUrl: '/partials/login',
                controller: 'loginController',
                access: { requiredLogin: false }
            }).
            otherwise({
                redirectTo: '/'
            });

        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });
    }])

    .run(function($rootScope, $location, sessionService) {
        $rootScope.$on("$routeChangeStart", function (event, nextRoute, currentRoute) {
            if (nextRoute.access.requiredLogin && !sessionService.getUserAuthenticated()) {
                $location.path("/login");
            }
        })
    });


