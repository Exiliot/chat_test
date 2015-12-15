(function() {
    'use strict';

    /*global $:true*/

    angular
        .module('app')
        .controller('MainController', ['$scope', '$http', '$q', '$log', '$uibModal', 'Socket', 'ngAudio', function($scope, $http, $q, $log, $modal, Socket, ngAudio) {
            var vm = this;
            vm.socket = Socket;
            vm.messages = [];
            vm.notifySound = ngAudio.load('http://www.freesound.org/data/previews/184/184438_850742-lq.mp3');

            vm.initUsers = function() {
                $http.get('/api/users').success(function(response) {
                    vm.users = response;
                }).error(function(err, status) {
                    $log.error(err, status);
                });
            };

            vm.selectChannel = function(channel) {
                vm.activeChannel = channel;
                if (vm.channels) {
                    var ret = false;
                    angular.forEach(vm.channels, function(vmChannel) {
                        if (channel._id === vmChannel._id) {
                            vmChannel.$selected = true;
                            ret = true;
                        }
                    });
                    if (!ret) {
                        channel.$selected = true;
                        vm.channels.push(channel);
                    }
                }
            };

            vm.afterChatInited = function(channels, user) {
                vm.channels = channels;
                vm.user = user;
                if (channels.length) {
                    channels[0].$selected = true;
                    vm.activeChannel = channels[0];
                }

                refreshIsOwnRoom(channels, user);
            };

            vm.afterJoinToChat = function(channel, messages) {
                // $log.debug('afterJoinToChat', messages);
                if (vm.activeChannel && channel && vm.activeChannel._id === channel._id) {
                    vm.messages = messages;
                }
            };

            vm.afterGetMessage = function(channel, message) {
                // $log.debug('afterGetMessage', channel, message);
                if (vm.activeChannel && channel && vm.activeChannel._id === channel._id) {
                    vm.messages.push(message);
                }
                if (message && message.user && message.user._id && message.user._id !== vm.user) {
                    vm.notifySound.play();
                }
            };

            vm.refreshOnlineUsers = function(users) {
                // $log.debug('refreshOnlineUsers', users);
                angular.forEach(vm.users, function(user) {
                    if (users.indexOf(user._id) !== -1) {
                        user.$status = 1;
                    } else {
                        user.$status = 0;
                    }
                });
            };

            vm.createRoom = function() {
                Socket.emit('chat:createRoom');
            };

            vm.onRoomCreated = function(channel) {
                vm.selectChannel(channel);
                refreshIsOwnRoom(vm.channels, vm.user);
            };

            vm.inviteToRoom = function() {
                var ModalInstanceCtrl = function($scope, $modalInstance) {
                    $scope.users = vm.users;
                    $scope.temp = {};

                    $scope.ok = function(users) {
                        $modalInstance.close(users);
                    };
                    $scope.cancel = function() {
                        $modalInstance.dismiss(null);
                    };
                };
                ModalInstanceCtrl.$inject = ['$scope', '$uibModalInstance'];

                var modalInstance = $modal.open({
                    templateUrl: '../app/components/main/inviteToRoom.html',
                    controller: ModalInstanceCtrl
                });

                modalInstance.result.then(function(res) {
                    Socket.emit('chat:inviteToRoom', {
                        invitedUsers: res,
                        channel: vm.activeChannel._id
                    });
                }, function() {
                    $log.debug('cancel');
                });
            };

            $scope.$watch(function() {
                return $(window).height();
            }, function(newVal) {
                angular.element('.users-list').height(newVal * 0.8);
            });

            function refreshIsOwnRoom(channels, user) {
                var ret = false;
                angular.forEach(channels, function(channel) {
                    if (channel.owner === user) {
                        ret = true;
                    }
                });
                vm.isOwnRoom = ret;
            }

        }]);

})();
