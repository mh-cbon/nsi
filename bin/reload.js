
var whichSc     = require('@mh-cbon/which-service-manager');
var stdErrors   = require('../lib/std-errors.js');
var pkg         = require('../package.json');
var debug       = require('debug')(pkg.name);

var reload = function (argv, done) {
  var name = pkgSource = argv['_'][0];
  var sys = pkgSource = argv.sysinit;
  if(!name) return done(stdErrors.wrongUsage("nsi reload [service name]"))
  if (sys && whichSc.sysInits.indexOf(sys)===-1)
    return done(stdErrors.unknownInitSytem(scMngr));

  var execCmd = function (scMngr) {
    var Sapi = require('../sapi/' + scMngr + '.js');
    var child = (new Sapi()).reload(name, argv, function (err) {
      if (err) return done(err);
      console.log('service reloaded: %s', name)
      done();
    })
    child && child.stderr && child.stderr.pipe(process.stderr);
    child && child.stdout && child.stdout.pipe(process.stdout);
  }
  if (sys) execCmd(sys)
  else {
    whichSc(function (err, scMngr, bin) {
      if (err) return done(stdErrors.notFoundInitSytem());
      execCmd(scMngr)
    })
  }
}

module.exports = reload;
