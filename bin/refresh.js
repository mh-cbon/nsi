
var whichSc     = require('@mh-cbon/which-service-manager');
var stdErrors   = require('../lib/std-errors.js');
var pkg         = require('../package.json');
var debug       = require('debug')(pkg.name);

var refresh = function (argv, done) {
  var sys = pkgSource = argv.sysinit;

  if (sys && whichSc.sysInits.indexOf(sys)===-1)
    return done(stdErrors.unknownInitSytem(scMngr));

  var execCmd = function (scMngr) {
    var Sapi = require('../sapi/' + scMngr + '.js');
    var child = (new Sapi()).refresh(argv, function (err) {
      if (err) return done(err);
      console.log('system refreshed')
      done();
    });
    child.stderr && child.stderr.pipe(process.stderr);
    child.stdout && child.stdout.pipe(process.stdout);
  }

  if (sys) execCmd(sys)
  else {
    whichSc(function (err, scMngr, bin) {
      if (err) return done(stdErrors.notFoundInitSytem());
      execCmd(scMngr)
    })
  }
}

module.exports = refresh;
