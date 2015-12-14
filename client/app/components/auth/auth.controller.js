(function() {
    'use strict';

    angular
        .module('app')
        .controller('AuthController', ['$scope', '$http', '$log', function($scope, $http, $log) {
            var vm = this;

            vm.signUp = function(user) {
                $http.post('/api/users', user).success(function() {
                    window.location.reload();
                }).error(function(err, status) {
                    $log.error(err, status);
                });
            };

            vm.login = function(user) {
                $http.post('/api/login', user).success(function(response) {
                    localStorage.setItem('username', response.username);
                    window.location.reload();
                }).error(function(err, status) {
                    $log.error(err, status);
                    vm.loginErr = err;
                });
            };

        }]);

})();
