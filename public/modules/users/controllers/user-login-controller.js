'use strict'

angular.module('UsersModule')
    .controller('UserLoginController', function ($scope, $location, $window, User, Authentication) {
               
        //Admin User Controller (login, logout)
        this.login = function (username, password) {
            if (username !== undefined && password !== undefined) {
                var authdata = btoa(username + ':' + password);
                $window.sessionStorage.token = authdata;
                User.getByUsername(username)
                    .success(function (response) {
                        Authentication.user = response;
                        $scope.success = true;
                        $location.path('/');
                    })
                    .error(function (error) {
                        Authentication.user = null;
                        delete $window.sessionStorage.token;
                        $scope.error = error.message;
                    })
            }
        }

        this.logout = function () {
            if (Authentication.user) {
                Authentication.user = null;
                delete $window.sessionStorage.token;
            }
        }

        this.isLogged = function () {
            return Authentication.user;
        }

    });