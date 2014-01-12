var fs = require('fs');

var _ = require('lodash');
var exec = require('child_process').exec;

(function(dirs) {
  var watcher = {
    cmd: {
      'jade': 'jade src/views/index.jade -o src/pub',
      'styl': 'stylus -c src/styles/main.styl -o src/pub/css/'
    },
    formatDate: function() {
      var d = new Date();
      return d.getHours() + ':' + d.getMinutes() + ':' + d .getSeconds();
    },

    getType: function(filename) {
      return filename.split('.').pop();
    },

    doCompile: function(event, filename) {
      var type = this.getType(filename);
      if(!this.cmd[type]) return;
      exec(this.cmd[type]);
      var msg = this.formatDate() + ' => ' + filename;
      console.log( /jade/.test(type) ? msg.magenta : msg.green);
    },

    doWatch: function(dirs) {
      _.each(dirs, function(dir) {
        fs.watch(dir, this.doCompile.bind(this))
      }, this);
    }
  };
  watcher.doWatch(dirs);
}(process.argv.slice(2)));