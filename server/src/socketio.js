'use strict';

var socketio = require('socket.io');
var cookie = require('cookie');
var cookieParser = require('cookie-parser');
var signature = require('cookie-signature');

var chatController = require('./chat/chat.controller');

module.exports = function(server, store) {
    var io = socketio(server);

    io.set('authorization', function(handshakeData, accept) {
        if (handshakeData.headers.cookie) {
            handshakeData.cookie = cookie.parse(handshakeData.headers.cookie);
            handshakeData.sessionID = cookieParser.signedCookie(handshakeData.cookie['connect.sid'], 'TxZe1unoUH');
            if (handshakeData.cookie['connect.sid'] === handshakeData.sessionID) {
                return accept('Cookie is invalid.', false);
            }
        } else {
            return accept('No cookie transmitted.', false);
        }
        accept(null, true);
    });

    var users = [];
    io.on('connection', function(socket) {
        var user;

        if (socket.handshake && socket.handshake.headers && socket.handshake.headers.cookie) {
            var raw = cookie.parse(socket.handshake.headers.cookie)['connect.sid'];
            if (raw) {
                socket.sessionId = signature.unsign(raw.slice(2), 'TxZe1unoUH') || undefined;
            }
        }
        if (socket.sessionId) {
            store.get(socket.sessionId, function(err, session) {
                if (err) {
                    console.log('Error while getting session');
                } else if (session && session.passport && session.passport.user) {
                    user = session.passport.user;
                    console.log('User %s connected', user);
                    socket.emit('connected', user);
                    if (users.indexOf(user) === -1) {
                        users.push(user);
                        io.emit('chat:onlineUsers', users);
                    }
                }
            });
        }

        socket.on('chat:init', function() {
            console.log('chat:init');
            chatController.getListOfChannels(user, function(err, chatChannels) {
                if (err) {
                    console.log('Error while getting chat channels', err);
                } else {
                    socket.emit('chat:inited', chatChannels);
                }
            });
        });

        socket.on('chat:joinToChannel', function(chatChannel) {
            chatController.getMessagesForChannel(chatChannel, function(err, messages) {
                if (err) {
                    console.log('Error while chat:joinToChannel ' + JSON.stringify(chatChannel), err);
                } else {
                    socket.emit('chat:messagesForChannel:' + chatChannel._id, messages);
                }
            });
        });

        socket.on('chat:messageSend', function(data) {
            data.user = user;
            chatController.writeMessage(data, function(err, message) {
                if (err) {
                    console.log('Error while saving the chat message ' + JSON.stringify(data), err);
                } else {
                    io.emit('chat:messageInChannel:' + message.channel, message);
                }
            });
        });

        socket.on('chat:loadEarlierMessages', function(data) {
            console.log('in chat:loadEarlierMessages', data);
            chatController.getMessagesForChannel({
                _id: data.channel
            }, function(err, messages) {
                if (err) {
                    console.log('Error while chat:loadEarlierMessages ' + JSON.stringify(data), err);
                } else {
                    socket.emit('chat:earlierMessages:' + data.channel, messages);
                    // console.log('EMITED: ', 'chat:earlierMessages:' + data.channel, messages);
                }
            }, data.skip);
        });

        socket.on('disconnect', function() {
            console.log('<-- Chat - user disconnected', user);
            if (users.indexOf(user) !== -1) {
                users.splice(users.indexOf(user), 1);
                io.emit('chat:onlineUsers', users);
            }
        });

    });

    return io;
};
