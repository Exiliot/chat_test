(function() {
    'use strict';

    angular
        .module('app')
        .run(run);

    run.$inject = ['$window', '$translate', '$http', '$q', '$log', 'tmhDynamicLocale', 'Permission'];

    function run($window, $translate, $http, $q, $log, tmhDynamicLocale, Permission) {

        // Get lang from browser
        var nav = $window.navigator;
        var lang = nav.language || nav.browserLanguage || nav.systemLanguage || nav.userLanguage;

        if (lang.length > 2) {
            lang = lang.substring(0, 2);
        }

        // Set lang to i18n modules
        $translate.use(angular.lowercase(lang));
        tmhDynamicLocale.set(angular.lowercase(lang));

        function getRoleHandler(role) {
            return function() {
                var deferred = $q.defer();
                $http.get('/api/permissions/hasRole', {
                    params: {
                        role: role
                    }
                }).success(function(response) {
                    if (response === true) {
                        deferred.resolve();
                    } else {
                        deferred.reject();
                    }
                }).error(function(err, status) {
                    $log.error(err, status);
                    deferred.reject();
                });

                return deferred.promise;
            };
        }

        Permission
            .defineRole('guest', getRoleHandler('guest'));
        Permission
            .defineRole('registered', getRoleHandler('registered'));

    }
})();
