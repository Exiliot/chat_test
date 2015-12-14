'use strict';

var User = require('../user/user.model');

exports.hasRole = function(req, res) {
    if (req.user) {
        User
            .findOne({
                _id: req.user._id
            }, {
                _id: 1
            }, function(err, user) {
                if (err) {
                    console.log(__filename, err);
                    res.status(500).send(err);
                } else {
                    if (user) {
                        res.send(req.query.role === 'registered');
                    } else {
                        res.end();
                    }
                }
            });
    } else {
        return res.send(req.query.role === 'guest');
    }
};
