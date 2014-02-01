#!/usr/bin/env node

/**
 * @param {Object} [...., ["paths"], ["files"], "dist", /reGex/]
 * @param {Function} callback[currentChange, allFiles, onFinish[error, data]]
 *
*/

var
    fs = require('fs'),
    path = require('path'),
    colors = require('colors');

var watcher = module.exports = function(opt, react) {

    var OPTIONS = {
        paths  : opt.paths || [],
        files  : opt.files || [],
        dist   : opt.dist  || "compailed.html",
        rgx    : opt.rgx   || /\.jade$/,
        fail   : opt.fail  || false,
        msgOk         : opt.msgOk         || "saved",
        msgErrCompile : opt.msgErrCompile || "resived error from file:",
        msgErrSave    : opt.msgErrSave    || "cannot save file"
    };

    var
        log = console.log.bind(console),

        onFinish = function(fileName) {
            return function(err) {
                if(err) throw err;
                log(new Date().toTimeString().split(' ').shift()['grey'], OPTIONS.msgOk['green'], fileName);
            }
        },

        isExt = function(file) {
            return OPTIONS.rgx.test(file)
        },

        remap = function(dir) {
            return function(file) {
                return path.join(dir, file);
            }
        },

        onFiles = function(dir, fn) {
            return function(err, files) {
                if (err) throw err;
                OPTIONS.files = OPTIONS.files.concat(files.filter(isExt).map(remap(dir)));
                if (fn) fn(OPTIONS.files);
            }
        },

        onDir = function(n, fn) {
            return function(dir) {
                n--;
                return fs.readdir(dir, onFiles(dir, !n ? fn : null));
            }
        },

        onChange = function(file) {
            var fileName = file;

            return function (curr, prev) {

                react(fileName, OPTIONS.files, function (err, res) {
                    if (err) {
                        log(OPTIONS.msgErrCompile['red'], fileName['magenta']);
                        if(!!OPTIONS.fail) throw err;
                        log(err.toString()['grey']);
                        return;
                    }
                    fs.writeFile(OPTIONS.dist, res, onFinish(fileName))
                });
            }
        },

        init = function(files) {
            files.forEach(function(file) {
                fs.watchFile(file, onChange(file));
            });
        };

    if(OPTIONS.paths.length === 0 ) {
        init(OPTIONS.files);
    } else {
        OPTIONS.paths.forEach(onDir(OPTIONS.paths.length, init));
    }
};