var
    fs     = require('fs'),
    path   = require('path'),
    colors = require('colors'),
    watch  = module.exports = function($) {

        $.files = $.files || [];
        $.rgx   = $.rgx || /\.jade$/;

        var
            byRgx = $.rgx.test.bind($.rgx),

            onSave = function(file) {
                return function(err) {
                    if (err) throw err;
                    console.log('saved'.green, file);
                }
            },

            onChange = function(file, files, output, callback, fail) {
                return function() {
                    callback(file, files, function(err, data) {
                        if(err && fail) throw err;
                        err ? console.error(colors.red(err.message).inverse, colors.red(file).bold) : fs.writeFile(output, data, onSave(file));
                    });
                }
            },

            resolve = function(dir) {
               return fs.readdirSync(dir)
                        .filter(byRgx)
                        .map(function(f) {
                            return path.join(dir, f);
                        });
            };

        if ($.dirs) {
            $.dirs.forEach(function(dir) {
                $.files = $.files.concat(resolve(dir))
            });
        }

        $.files.forEach(function(fl) {
            var fn = onChange(fl, $.files, $.dist, $.react, $.fail); fn();
            fs.watchFile(fl, fn);
        });
    };