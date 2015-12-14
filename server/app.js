'use strict';

// Set default environment variables
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.NODE_CONFIG_DIR = __dirname + '/config/';

var express = require('express');
var config = require('config');
var cors = require('cors');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var expressValidator = require('express-validator');
var session = require('express-session');
var MongoStore = require('connect-mongo')({
    session: session
});
var flash = require('connect-flash');

var routes = require('./src/routes');

/**
 * MongoDB configurations
 */
var mongodbUrl = 'mongodb://' + config.DB_HOST + ':' + config.DB_PORT + '/' + config.DB_NAME;

// Database options
var dbOptions = {
    server: {
        socketOptions: {
            keepAlive: 1
        }
    },
    auto_reconnect: true
};

mongoose.set('debug', true);
mongoose.connection.on('error', function(err) {
    console.error('MongoDB Connection Error. Please make sure MongoDB is running. -> ' + err);
});
// Auto reconnect on disconnected
mongoose.connection.on('disconnected', function() {
    mongoose.connect(mongodbUrl, dbOptions);
});
// Connect to db
mongoose.connect(mongodbUrl, dbOptions);

// Passport config
var User = require('./src/user/user.model');
// Serialize the user id to push into the session
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

// Deserialize the user object based on a pre-serialized token
// which is the user id
passport.deserializeUser(function(id, done) {
    User.findOne({
        _id: id
    }, '-salt -hashed_password', function(err, user) {
        done(err, user);
    });
});

// Use local strategy
passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
}, function(username, password, done) {
    User
        .findOne({
            username: {
                $regex: new RegExp('^' + username + '$', 'i')
            }
        }, function(err, user) {
            if (err) {
                return done(err);
            } else {
                if (!user) {
                    return done(null, false, {
                        message: 'Unknown user'
                    });
                }
                if (!user.authenticate(password)) {
                    return done(null, false, {
                        message: 'Invalid password'
                    });
                }
                return done(null, user);
            }
        });
}));

/**
 * Express app configurations
 */
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(expressValidator());
app.use(cookieParser('vulIWIEK8l'));
app.use(flash());
var store = new MongoStore({
    url: mongodbUrl
});
app.use(session({
    store: store,
    secret: 'TxZe1unoUH',
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
// Enable CORS
app.use(cors());

// Bootstrap routes
app.use(routes);

// Static files
app.use('/images', express.static(process.cwd() + '/images'));

// Once database open, start server
mongoose.connection.once('open', function callback() {
    console.log('Connection with database succeeded.');
    var server = app.listen(config.APP_PORT, function() {
        console.log('app listening on port %d in %s mode', this.address().port, app.settings.env);
    });
    require('./src/socketio')(server, store);
});

app.route('/api/login')
    .post(passport.authenticate('local', {
        failureFlash: true
    }), function(req, res) {
        res.json(req.user);
    });

// app.post('/api/login', function(req, res) {
//     passport.authenticate('local', function(err, user, info) {
//         if (err) {
//             console.log('Error while authenticating', err);
//             res.status(500).send(err);
//         } else {
//             console.log('user', user, 'info', info);
//             if (!user) {
//                 res.status(401).send(info.message);
//             } else {
//                 res.jsonp(user);
//             }
//         }
//     })(req, res);
// });

app.route('/api/logout')
    .get(function(req, res) {
        req.logout();
        res.redirect('/');
    });

module.exports = app;
