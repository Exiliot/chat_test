'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ChatChannelSchema = new Schema({
    title: {
        type: String,
        require: true
    },
    mode: {
        type: Number, // 0 - public, 1 - by invites,
        default: 0
    },
    owner: {
        type: Schema.ObjectId,
        ref: 'User'
    }
});

ChatChannelSchema.on('init', function(model) {
    model.find(function(err, chatChannels) {
        if (!err && !chatChannels.length) {
            var defaultChannels = [{
                title: 'main.publicChannel'
            }];
            model.create(defaultChannels, function(err) {
                if (!err) {
                    console.log('Chat channels collection was inited successfully');
                }
            });
        }
    });

});

module.exports = mongoose.model('ChatChannel', ChatChannelSchema);
