var pkg         = require('../package.json');
var debug       = require('debug')(pkg.name);
var dStream     = require('debug-stream')(debug);

var debugChild = function (name, child) {
  child.stdout && child.stdout.pipe(dStream(name + '.stdout %s').resume());
  child.stderr && child.stderr.pipe(dStream(name + '.stderr %s').resume());
  child.on('close', function (code) {
    console.error('%s.code=%s', name, code);
  })
}

module.exports = debugChild;
