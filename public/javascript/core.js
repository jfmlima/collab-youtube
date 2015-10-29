// public/core.js
angular.module('collabYoutube', ['collabYoutube.controllers', 'collabYoutube.services', 'ui.bootstrap', 'ngRoute', 'btford.socket-io'])

    .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
        $routeProvider.
            when('/', {
                templateUrl: '/partials/index',
                controller: 'mainController',
                resolve: {
                    loggedIn: checkLoggedin
                }
            }).
            when('/login', {
                templateUrl: '/partials/login',
                controller: 'loginController',
            }).
            when('/room/:id', {
                templateUrl: '/partials/room',
                controller: 'roomController',
            }).
            otherwise({
                redirectTo: '/'
            });

        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });
    }])

    .config(['$httpProvider', function($httpProvider){

        $httpProvider.interceptors.push(function($q, $location) {
            return {
                response: function(response) {
                    // do something on success
                    return response;
                },
                responseError: function(response) {
                    if (response.status === 401)
                        $location.url('/login');
                    return $q.reject(response);
                }
            };
        })
    }])


var checkLoggedin = function($q, $timeout, $http, $location, $rootScope, $session){
// Initialize a new promise
    var deferred = $q.defer(); // Make an AJAX call to check if the user is logged in
    $http.get('/auth/isAuthenticated').success(function(user){

        // Authenticated
        if (user !== '0'){
            deferred.resolve();
            $session.setUser(user);
        }
        // Not Authenticated
        else { $rootScope.message = 'You need to log in.';
            deferred.reject();
            $location.url('/login');
        }
    });

    return deferred.promise;
};


