'use strict';

var ChatChannel = require('./chatChannel.model');
var ChatMessage = require('./chatMessage.model');
var mongoose = require('mongoose');

exports.getListOfChannels = function(userId, callback) {
    ChatChannel
        .find({
            $or: [{
                mode: 0 // public channel
            }, {
                owner: userId
            }, {
                invited: userId
            }]
        }, function(err, chatChannels) {
            if (err) {
                callback(err);
            } else {
                callback(null, chatChannels);
            }
        });
};

exports.getMessagesForChannel = function(chatChannel, callback, skip) {
    var n = 50;
    ChatMessage
        .aggregate([{
            $match: {
                channel: mongoose.Types.ObjectId(chatChannel._id),
                status: {
                    $ne: -1
                }
            }
        }, {
            $sort: {
                time: -1
            }
        }, {
            $skip: skip || 0
        }, {
            $limit: n
        }, {
            $project: {
                date: {
                    $concat: [{
                        $substr: [{
                            $year: '$time'
                        }, 0, 4]
                    }, '-', {
                        $cond: [{
                            $lte: [{
                                $month: '$time'
                            }, 9]
                        }, {
                            $concat: [
                                '0', {
                                    $substr: [{
                                        $month: '$time'
                                    }, 0, 2]
                                }
                            ]
                        }, {
                            $substr: [{
                                $month: '$time'
                            }, 0, 2]
                        }]
                    }, '-', {
                        $cond: [{
                            $lte: [{
                                $dayOfMonth: '$time'
                            }, 9]
                        }, {
                            $concat: [
                                '0', {
                                    $substr: [{
                                        $dayOfMonth: '$time'
                                    }, 0, 2]
                                }
                            ]
                        }, {
                            $substr: [{
                                $dayOfMonth: '$time'
                            }, 0, 2]
                        }]
                    }]
                },
                message: 1,
                user: 1,
                image: 1,
                time: 1,
                channel: 1
            }
        }, {
            $sort: {
                time: 1
            }
        }])
        .exec(function(err, messages) {
            if (err) {
                callback(err);
            } else {
                // console.log('messages', messages);
                if (messages && messages.length) {
                    ChatMessage
                        .populate(messages, {
                            path: 'user',
                            model: 'User',
                            select: {
                                name: 1,
                                email: 1,
                                username: 1
                            }
                        }, function(err, messages) {
                            if (err) {
                                callback(err);
                            } else {
                                // console.log(msgs);
                                callback(null, messages);
                            }
                        });
                } else {
                    callback(null, []);
                }
            }
        });
};

exports.writeMessage = function(data, callback) {
    var message = new ChatMessage(data);
    message.save(function(err) {
        if (err) {
            callback(err);
        } else {
            ChatMessage
                .findOne({
                    _id: message._id
                })
                .populate('user', 'name email username')
                .exec(function(err, message) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, message);
                    }
                });
        }
    });
};

exports.getChannelByOwner = function(userId, callback) {
    ChatChannel
        .findOne({
            owner: userId
        }, function(err, chatChannel) {
            if (err) {
                callback(err);
            } else {
                if (chatChannel) {
                    callback(null, chatChannel);
                } else {
                    require('../user/user.model')
                        .findById(userId, function(err, user) {
                            if (err) {
                                callback(err);
                            } else {
                                if (user) {
                                    var newChatChannel = new ChatChannel({
                                        title: user.username + '\'s room',
                                        mode: 1,
                                        owner: userId
                                    });
                                    newChatChannel.save(function(err) {
                                        if (err) {
                                            callback(err);
                                        } else {
                                            callback(null, newChatChannel);
                                        }
                                    });
                                } else {
                                    callback('Wrong user ID');
                                }
                            }
                        });
                }
            }
        });
};

exports.inviteToRoom = function(data, callback) {
    ChatChannel
        .update({
            _id: data.channel
        }, {
            $addToSet: {
                invited: {
                    $each: data.invitedUsers
                }
            }
        }, function(err, numAffected) {
            if (err) {
                callback(err);
            } else {
                console.log('updated', numAffected);
                callback();
            }
        });
};
