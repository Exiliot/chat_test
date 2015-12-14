(function() {
    'use strict';

    /*global $:true*/

    angular
        .module('app')
        .controller('MainController', ['$scope', '$http', '$q', '$log', 'Socket', function($scope, $http, $q, $log, Socket) {
            var vm = this;
            vm.socket = Socket;
            vm.messages = [];

            vm.initUsers = function() {
                $http.get('/api/users').success(function(response) {
                    vm.users = response;
                }).error(function(err, status) {
                    $log.error(err, status);
                });
            };

            vm.afterChatInited = function(channels) {
                vm.channels = channels;
                if (channels.length) {
                    channels[0].$selected = true;
                    vm.activeChannel = channels[0];
                }
            };

            vm.afterJoinToChat = function(channel, messages) {
                // $log.debug('afterJoinToChat', messages);
                if (vm.activeChannel && channel && vm.activeChannel._id === channel._id) {
                    vm.messages = messages;
                }
            };

            vm.afterGetMessage = function(channel, message) {
                $log.debug('afterGetMessage', channel, message);
                if (vm.activeChannel && channel && vm.activeChannel._id === channel._id) {
                    vm.messages.push(message);
                }
                // if (message && message.user && message.user._id && JSON.stringify(message.user._id) !== JSON.stringify(Global.user.id))
                //     $scope.channelNotifyer.play();
            };

            vm.refreshOnlineUsers = function(users) {
                $log.debug('refreshOnlineUsers', users);
                angular.forEach(vm.users, function(user) {
                    if (users.indexOf(user._id) !== -1) {
                        user.$status = 1;
                    } else {
                        user.$status = 0;
                    }
                });
            };

            $scope.$watch(function() {
                return $(window).height();
            }, function(newVal) {
                angular.element('.users-list').height(newVal * 0.8);
            });

        }]);

})();
