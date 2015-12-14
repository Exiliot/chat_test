'use strict';

var User = require('./user.model');

exports.signUp = function(req, res) {
    var user = new User(req.body);
    req.assert('name', 'You must enter a name').notEmpty();
    req.assert('email', 'You must enter a valid email address').isEmail();
    req.assert('password', 'Password must be between 8-20 characters long').len(8, 20);
    req.assert('username', 'Username cannot be more than 20 characters').len(1, 20);
    req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);

    var errors = req.validationErrors();

    if (errors) {
        return res.status(400).send(errors);
    }

    user.save(function(err) {
        if (err) {
            switch (err.code) {
                case 11000:
                    res.status(400).send([{
                        msg: 'Username already taken',
                        param: 'username'
                    }]);
                    break;
                case 11001:
                    res.status(400).send([{
                        msg: 'Username already taken',
                        param: 'username'
                    }]);
                    break;
                default:
                    var modelErrors = [];
                    if (err.errors) {
                        for (var x in err.errors) {
                            modelErrors.push({
                                param: x,
                                msg: err.errors[x].message,
                                value: err.errors[x].value
                            });
                        }
                        res.status(400).json(modelErrors);
                    }
            }
        } else {
            req.logIn(user, function(err) {
                if (err) {
                    console.log(err);
                    res.status(500).send(err);
                } else {
                    res.end();

                    var transporter = require('nodemailer').createTransport({
                        service: 'SMTP',
                        auth: {
                            user: 'support@acrm.io',
                            pass: 's@upportsupportsupportsuppor@t'
                        },
                        host: 'mail.mailgroup.pro',
                        port: 587,
                        secure: false,
                        requireTLS: true,
                        tls: {
                            rejectUnauthorized: false
                        }
                    });

                    var mailOptions = {
                        from: 'Support Service ✔ <support@acrm.io>',
                        to: user.email,
                        subject: 'Welcome to awesome chat!',
                        html: '<p style="margin:10px 0 0 0">Your chat account has been created!<br><br>Your username is: <strong>' + user.username + '</strong><br><br>Your password: ' + req.body.password + '</p>'
                    };

                    transporter.sendMail(mailOptions, function(err, info) {
                        if (err) {
                            console.log('Error while sending email after registration', err);
                        } else {
                            console.log('Message sent: ' + info.response);
                        }
                    });
                }
            });
        }
    });
};

exports.getUsers = function(req, res) {
    User
        .find({
            _id: {
                $ne: req.user._id
            }
        }, {
            name: 1,
            username: 1
        }, function (err, users) {
            if (err) {
                console.log(__filename, err);
                res.status(500).send(err);
            } else {
                res.jsonp(users);
            }
        });
};
