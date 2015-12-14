'use strict';

var express = require('express');
var router = express.Router();
var multer = require('multer')({
    dest: '../../.tmp/'
});

var user = require('./user/user.controller');

// users ressources
router.get('/api/users', user.getUsers);
// router.get('/api/users/:id', users.get);
router.post('/api/users', user.signUp);
// router.put('/api/users/:id', users.put);

var permissions = require('./permissions/permissions.controller');

router.get('/api/permissions/hasRole', permissions.hasRole);

var uploader = require('./uploader/upload.controller');

router.post('/api/uploadImage', multer.any(), uploader.uploadImage);

module.exports = router;
