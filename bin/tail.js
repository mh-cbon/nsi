
var whichSc     = require('@mh-cbon/which-service-manager');
var stdErrors   = require('../lib/std-errors.js');
var pkg         = require('../package.json');
var debug       = require('debug')(pkg.name);
var pathToBin   = require('@mh-cbon/sudo-fs/lib/path-to-bin.js');
var yasudo      = require('@mh-cbon/c-yasudo');
var aghfabsowec = require('@mh-cbon/c-aghfabsowecwn').spawn;
var spawn       = require('child_process').spawn;
var LaunchdSimpleApi = require('@mh-cbon/launchd-simple-api');

var lsa = new LaunchdSimpleApi();

var tail = function (argv, done) {
  var name = pkgSource = argv['_'][0];
  var sys = pkgSource = argv.sysinit;
  if(!name) return done(stdErrors.wrongUsage("nsi tail [service name]"))
  if (sys && whichSc.sysInits.indexOf(sys)===-1)
    return done(stdErrors.unknownInitSytem(scMngr));

  var execCmd = function (scMngr) {
    if (['sc', 'launchd', 'upstart', 'chkconfig', 'sysv'].indexOf(scMngr)>-1) {
      pathToBin('tailf', function (err, binPath) {
        var logFile = '';
        if (scMngr==='sc') {
          var AppDirectory = require('appdirectory')
          var svcPath = new (require('appdirectory'))(name).userData()
          logFile = path.join(svcPath, name + '.log');
        } else if (scMngr==='launchd') {
          logFile = lsa.forgeStdLogPath({domain: argv.system ? 'global' : 'user'}) + name + ".log";
        } else {
          logFile = '/var/log/' + name + '.log';
        }
        var child;
        if (sc) child = aghfabsowec(process.argv[0], [binPath], {stdio: 'pipe'});
        else child = yasudo(process.argv[0], [binPath], {stdio: 'pipe'});
        child.stdout.pipe(process.stdout);
        child.stderr.pipe(process.stderr);
        process.once('SIGINT', function () {
          child.kill();
        });
      })
    } else if (scMngr==='systemd'){
      var child = spawn('journalctl', ['-f', '-u', name]);
      child.stdout.pipe(process.stdout);
      child.stderr.pipe(process.stderr);
      process.once('SIGINT', function () {
        child.kill();
      });
    }
  }
  if (sys) execCmd(sys)
  else {
    whichSc(function (err, scMngr, bin) {
      if (err) return done(stdErrors.notFoundInitSytem());
      execCmd(scMngr)
    })
  }
}

module.exports = tail;
