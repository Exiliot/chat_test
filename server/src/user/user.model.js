'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    crypto = require('crypto');

var UserSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    username: {
        type: String,
        required: true,
        unique: true,
        // lowercase: true,
        // trim: true,
        match: [/^[a-zA-Z0-9]+$/, 'Please fill a valid username']
    },
    hashed_password: {
        type: String
    },
    salt: {
        type: String
    }
});

UserSchema.virtual('password').set(function(password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashed_password = this.hashPassword(password);
}).get(function() {
    return this._password;
});

UserSchema.methods = {
    /**
     * Authenticate - check if the passwords are the same
     *
     * @param {String} plainText
     * @return {Boolean}
     * @api public
     */
    authenticate: function(plainText) {
        return this.hashPassword(plainText) === this.hashed_password;
    },

    /**
     * Make salt
     *
     * @return {String}
     * @api public
     */
    makeSalt: function() {
        return crypto.randomBytes(16).toString('base64');
    },

    /**
     * Hash password
     *
     * @param {String} password
     * @return {String}
     * @api public
     */
    hashPassword: function(password) {
        if (!password || !this.salt) {
            return '';
        } else {
            var salt = new Buffer(this.salt, 'base64');
            return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
        }
    },

    /**
     * Hide security sensitive fields
     * 
     * @returns {*|Array|Binary|Object}
     */
    toJSON: function() {
        var obj = this.toObject();
        delete obj.hashed_password;
        delete obj.salt;
        return obj;
    }
};

module.exports = mongoose.model('User', UserSchema);
