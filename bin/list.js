
var whichSc     = require('@mh-cbon/which-service-manager');
var stdErrors   = require('../lib/std-errors.js');
var pkg         = require('../package.json');
var debug       = require('debug')(pkg.name);

var list = function (argv, done) {
  var sys = pkgSource = argv.sysinit;
  if (sys && whichSc.sysInits.indexOf(sys)===-1)
    return done(stdErrors.unknownInitSytem(scMngr));

  var execCmd = function (scMngr) {
    var Sapi = require('../sapi/' + scMngr + '.js');
    (new Sapi()).list(argv, function (err, items) {
      if (err) return done && done(err);
      if (argv['_'].length) {
        var k = items[argv['_'][0]];
        items = {};
        if (k) items[k.id || k.name] = k
      }
      console.log(JSON.stringify(items, null, 2));
      done && done();
    })
  }

  if (sys) execCmd(sys)
  else {
    whichSc(function (err, scMngr, bin) {
      if (err) return done(stdErrors.notFoundInitSytem());
      execCmd(scMngr)
    })
  }
}

module.exports = list;
