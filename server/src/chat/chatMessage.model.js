'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ChatMessageSchema = new Schema({
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    channel: {
        type: Schema.ObjectId,
        ref: 'ChatChannel',
        required: true
    },
    message: {
        type: String
    },
    image: {
        file: String,
        preview: String,
        background: String
    },
    time: {
        type: Date,
        default: Date.now
    },
    status: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('ChatMessage', ChatMessageSchema);
