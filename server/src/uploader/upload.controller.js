'use strict';

var fs = require('fs'),
    // ChatMessage = require('../chat/chatMessage.model'),
    mkdirOrig = fs.mkdir,
    directory = process.cwd() + '/images/uploaded',
    path = require('path'),
    osSep = path.sep,
    crypto = require('crypto'),
    gm = require('gm').subClass({
        imageMagick: true
    }),
    transliteration = require('transliteration');

function rename(file, dest, user, callback) {
    var newFileName = transliteration(path.normalize(file.originalname).split('.')[0], '_').split(' ').join('_') + '_' + crypto.createHash('md5').update(file.name + new Date().toISOString()).digest('hex').substring(0, 5) + (file.extension ? ('.' + file.extension) : (path.extname(file.originalname) ? path.extname(file.originalname) : ''));
    fs.rename(file.path, directory + dest + newFileName, function(err) {
        if (err) {
            callback(err);
        } else {
            var colorThief = new (require('color-thief'))(),
                rgb = colorThief.getColor(fs.readFileSync(directory + dest + newFileName)),
                hex = require('onecolor')('rgb(' + rgb.join(',') + ')').hex();

            gm(directory + dest + newFileName)
                .size(function(err, size) {
                    console.log('SIZE!!!', size);
                    if (err) {
                        callback(err);
                    } else {
                        if (size.width > 150) {
                            console.log('create thumb!');
                            gm(directory + dest + newFileName).thumb(150, 0, directory + dest + 'preview_' + newFileName, 75, function(err) {
                                if (err) {
                                    callback(err);
                                } else {
                                    callback(null, {
                                        file: '/images/uploaded' + dest + newFileName,
                                        preview: '/images/uploaded' + dest + 'preview_' + newFileName,
                                        background: hex
                                    });
                                }
                            });
                        } else {
                            console.log('don\'t create thumb');
                            callback(null, {
                                file: '/images/uploaded' + dest + newFileName,
                                preview: '/images/uploaded' + dest + newFileName
                            });
                        }
                    }
                });
        }
    });
}

function mkdir_p(path, callback, position) {
    var parts = require('path').normalize(path).split(osSep);

    position = position || 0;

    if (position >= parts.length) {
        return callback(null);
    }

    var directory = parts.slice(0, position + 1).join(osSep) || osSep;
    fs.stat(directory, function(err) {
        if (!err) {
            mkdir_p(path, callback, position + 1);
        } else {
            mkdirOrig(directory, function(err) {
                if (err && err.code !== 'EEXIST') {
                    return callback(err);
                } else {
                    mkdir_p(path, callback, position + 1);
                }
            });
        }
    });
}

exports.uploadImage = function(req, res) {
    // console.log(req.files);
    var uploadedFile = req.files && req.files.length ? req.files[0] : null;
    if (uploadedFile) {
        var dest = '/' + new Date().getFullYear() + '/' + ((new Date().getMonth() + 1) < 10 ? '0' + (new Date().getMonth() + 1) : (new Date().getMonth() + 1)) + '/' + (new Date().getDate() < 10 ? '0' + new Date().getDate() : new Date().getDate()) + '/';
        var path = directory + dest;
        if (!fs.existsSync(path)) {
            mkdir_p(path, function(err) {
                if (err) {
                    console.log('Error in mkdir_p', err);
                    return res.status(500).send(err);
                } else {
                    rename(uploadedFile, dest, req.user, function(err, file) {
                        if (err) {
                            return res.status(500).send(err);
                        } else {
                            return res.jsonp(file);
                        }
                    });
                }
            });
        } else {
            rename(uploadedFile, dest, req.user, function(err, file) {
                if (err) {
                    return res.status(500).send(err);
                } else {
                    return res.jsonp(file);
                }
            });
        }
    } else {
        res.status(500).send('File error');
    }
};

// exports.removeImageFromServer = function(req, res) {
//     console.log('dsds', req.body);
//     if (!req.body.image || !req.body.image.file || !req.body.image.preview)
//         return res.status(400).send('Bad request');
//     fs.unlink(process.cwd() + req.body.image.file, function(err) {
//         if (err) {
//             console.log(err);
//             return res.status(500).send(err);
//         } else {
//             fs.unlink(process.cwd() + req.body.image.preview, function(err) {
//                 if (err) {
//                     console.log(err);
//                     return res.status(500).send(err);
//                 } else
//                     if(req.body.message) {
//                         ChatMessage
//                             .update({
//                                 _id: req.body.message
//                             }, {
//                                 $pull: {
//                                     attachment: req.body.image
//                                 }
//                             }, function(err, numAffected) {
//                                 if(err) {
//                                     console.log(err);
//                                     return res.status(500).send(err);
//                                 } else {
//                                     console.log('updated', numAffected);
//                                     return res.status(200).end();
//                                 }
//                             });
//                     }
//                     else
//                         return res.status(200).end();
//             });
//         }
//     });
// };
