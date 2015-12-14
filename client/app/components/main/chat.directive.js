(function() {
    'use strict';

    /*global $:true*/

    angular
        .module('app')
        .directive('chat', function(Socket, Lightbox) {
            return {
                restrict: 'E',
                replace: true,
                templateUrl: 'app/components/main/chat.html',
                scope: {
                    activeChannel: '=',
                    chatMessages: '=',

                    afterChatInited: '&',
                    afterJoinToChat: '&',
                    afterGetMessage: '&',

                    onlineUsers: '&',
                    onLoadEarlierMessages: '&',

                    afterMessageEdited: '&',
                    afterMessageRemoved: '&'
                },
                link: function(scope) {
                    scope.messagesControl = scope.control || {};

                    scope.messagesControl.editMessage = function(message) {
                        // console.log('from directive: editMessage', message);
                        Socket.emit('chat:editMessage', message);
                    };

                    scope.messagesControl.removeMessage = function(message) {
                        // console.log('from directive: removeMessage', message);
                        Socket.emit('chat:removeMessage', message);
                    };

                    scope.loadMore = function() {
                        Socket.emit('chat:loadEarlierMessages', {
                            channel: scope.activeChannel._id,
                            skip: scope.chatMessages.length
                        });
                    };
                },
                controller: function($scope) {
                    $scope.listeningChannels = [];

                    Socket.on('connected', function(userId) {
                        console.log('connected');
                        Socket.status = 1;
                        $scope.user = userId;
                        Socket.emit('chat:init');
                    });

                    Socket.on('chat:inited', function(channels) {
                        $scope.channels = channels;
                        $scope.afterChatInited({
                            channels: channels
                        });
                    });

                    Socket.on('chat:onlineUsers', function(users) {
                        console.log('chat:onlineUsers', users);
                        $scope.onlineUsers({
                            users: users
                        });
                    });

                    $scope.listenChannel = function listenChannel(channel) {
                        console.log('listening channel: ', channel.title);

                        Socket.on('chat:messagesForChannel:' + channel._id, function(messages) {
                            $scope.afterJoinToChat({
                                channel: channel,
                                messages: messages
                            });
                        });

                        Socket.on('chat:messageInChannel:' + channel._id, function(message) {
                            // console.log('chat:messageInChannel:' + channel._id, message);
                            // if (scope.activeChannel._id === channel._id)
                            $scope.afterGetMessage({
                                channel: channel,
                                message: message
                            });
                        });

                        Socket.on('chat:earlierMessages:' + channel._id, function(data) {
                            console.log('chat:earlierMessages:' + channel._id, data);
                            if (data && data.length) {
                                $scope.chatMessages = data.concat($scope.chatMessages);
                            } else {
                                $scope.warnLoad = true;
                            }
                        });

                        //     NotificationSocket.on('chat:messageEdited:' + channel._id, function(message) {
                        //         $scope.afterMessageEdited({
                        //             message: message
                        //         });
                        //     });

                        //     NotificationSocket.on('chat:messageRemoved:' + channel._id, function(message) {
                        //         // console.log('some message was removed', message);
                        //         $scope.afterMessageRemoved({
                        //             message: message
                        //         });
                        //     });

                        //     if ($scope.listeningChannels.indexOf(channel._id) === -1)
                        //         $scope.listeningChannels.push(channel._id);

                    };

                    $scope.joinChannel = function(channel) {
                        if ($scope.listeningChannels.indexOf(channel._id) === -1) {
                            $scope.listenChannel(channel);
                        }

                        Socket.emit('chat:joinToChannel', channel);
                    };

                    $scope.$watch('activeChannel', function(newVal) {
                        if ($scope.activeChannel) {
                            $scope.joinChannel(newVal);
                        }
                    });

                    Socket.on('disconnect', function() {
                        console.log('disconnected');
                        Socket.status = 0;
                    });

                    $scope.$watch(function() {
                        return $(window).height();
                    }, function(newVal) {
                        angular.element('.chat-scrollbar').height(newVal * 0.7029);
                    });

                    $scope.openLightbox = function(image) {
                        Lightbox.openModal([{
                            url: image.file,
                            thumbUrl: image.preview
                        }], 0);
                    };

                }
            };
        });

})();
