// public/core.js
angular.module('collabYoutube', ['collabYoutube.controllers', 'collabYoutube.services', 'youtube-embed', 'ui.bootstrap', 'ngCookies','ngRoute', 'btford.socket-io'])

    .filter('unsafe', function($sce) {
        return $sce.trustAsHtml;
    })

    .run(function($location, $session){
        window.onbeforeunload = function () {
            console.log("aqui");
            $location.path("/");
        };
    })

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
                controller: 'loginController'
            }).
            when('/room/:id', {
                templateUrl: '/partials/room',
                controller: 'roomController',
                resolve: {
                    loggedIn: checkLoggedin,
                    roomExists: roomExists,
                    isOwner: function($q, $collab, $route){
                        var defer = $q.defer()
                        $collab.isRoomOwner($route.current.params.id, function(callback){
                            defer.resolve(callback);
                        })
                        return defer.promise;
                    }
                }
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

var roomExists = function($q, $collab, $location, $route){
    var defer = $q.defer()
    $collab.roomExists($route.current.params.id, function(callback){
        console.log(callback);

        if (callback){
            defer.resolve();
        }
        // Not Authenticated
        else {
            defer.reject();
            $location.url('/');
        }
    })
    return defer.promise;
}

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


