var spawn   = require('child_process').spawn;
var path    = require('path')
var pkg     = require('../package.json');
var debug   = require('debug')(pkg.name);

var npmInvoke = function (args, opts) {
var bin = process.argv[0]
  if (process.platform.match(/^win/)) {
    var bin = path.dirname(process.argv[0]) + '/npm.cmd'
  } else {
    args.unshift(path.dirname(bin) + '/npm')
  }
  debug('%s %s', bin, args.join(' '));
  var child = spawn(bin, args, opts);
  child.on('close', function (code) {
    debug('close code=%j', code);
  })
  return child;
}

module.exports = npmInvoke;
