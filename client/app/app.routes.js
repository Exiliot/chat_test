(function() {
    'use strict';

    angular
        .module('app')
        .config(routes);

    routes.$inject = ['$stateProvider', '$urlRouterProvider'];

    function routes($stateProvider, $urlRouterProvider) {
        $stateProvider.state('home', {
            url: '/',
            templateUrl: '/app/components/main/main.html',
            controller: 'MainController',
            controllerAs: 'mainVm',
            data: {
                permissions: {
                    only: ['registered'],
                    redirectTo: 'login'
                }
            }
        }).state('register', {
            url: '/auth/sign-up',
            templateUrl: '/app/components/auth/signUp.html',
            controller: 'AuthController',
            controllerAs: 'authVm',
            data: {
                permissions: {
                    only: ['guest'],
                    redirectTo: 'home'
                }
            }
        }).state('login', {
            url: '/auth/sign-in',
            templateUrl: '/app/components/auth/signIn.html',
            controller: 'AuthController',
            controllerAs: 'authVm',
            data: {
                permissions: {
                    only: ['guest'],
                    redirectTo: 'home'
                }
            }
        });

        $urlRouterProvider.otherwise('/');
    }
})();
