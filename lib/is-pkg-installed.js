
var npmInvoke   = require('./npm-invoke.js')
var pkg         = require('../package.json');
var debug       = require('debug')(pkg.name);

function isPackageInstalled (name, then) {
  var stdout = '';
  npmInvoke(['ls', name, '-g', '--json', '--long'], {stdio: 'pipe'})
  .on('close', function () {
    var json;
    try{
      json = JSON.parse(stdout);
    } catch(ex) {
      return then(ex);
    }
    if (!json['dependencies'][name]) return then('no');
    debug('pkgInfo=%j', json['dependencies'][name]);
    then(null, json['dependencies'][name]);
  })
  .stdout.on('data', function (d) {
    stdout += '' + d
  });
}

module.exports = isPackageInstalled;
