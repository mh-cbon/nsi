
var whichSc     = require('@mh-cbon/which-service-manager');
var stdErrors   = require('../lib/std-errors.js');
var pkg         = require('../package.json');
var debug       = require('debug')(pkg.name);
var sudoFs      = require('@mh-cbon/sudo-fs');
var yasudo      = require('@mh-cbon/c-yasudo');
var aghfabsowec = require('@mh-cbon/c-aghfabsowecwn').spawn;
var spawn       = require('child_process').spawn;
var LaunchdSimpleApi    = require('@mh-cbon/launchd-simple-api');
var SystemdSimpleApi    = require('@mh-cbon/systemd-simple-api');
var ChkconfigApi        = require('@mh-cbon/chkconfig-simple-api');
var SimpleScApi         = require('@mh-cbon/sc-simple-api');
var UpstartApi          = require('@mh-cbon/upstart-simple-api');
var temp = require("temp").track();
var path = require('path')
var fs = require('fs')
var editor = require('editors')

var sds = new SystemdSimpleApi();
var lsa = new LaunchdSimpleApi();

var tail = function (argv, done) {
  var name = pkgSource = argv['_'][0];
  var sys = pkgSource = argv.sysinit;
  if(!name) return done(stdErrors.wrongUsage("nsi edit [service name]"))
  if (sys && whichSc.sysInits.indexOf(sys)===-1)
    return done(stdErrors.unknownInitSytem(scMngr));

  var execCmd = function (scMngr) {
    var svcFile = getSvcPath(scMngr, name);

    editFile(svcFile, function (err, newContent) {
      if(!newContent) {
        console.log('No changes detected !')
        done();
      } else {
        // suspect this will have some problems regarding the permissions.
        sudoFs.writeFile(svcFile, newContent, function (err) {
          if (err) return done(err);
          reload(argv, scMngr, name, done);
        });
      }
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

function reload(argv, scMngr, svcName, done) {
  if (scMngr==='sc') {
    var ssa = new SimpleScApi();
    ssa.enableElevation('');
    ssa.restart(svcName, [], done);
  } else if (scMngr==='chkconfig') {
    var chapi = new ChkconfigApi();
    chapi.enableElevation('');
    chapi.restart(svcName, done);
  } else if (scMngr==='sysv') {
    done('fatal: unsupported')
  } else if (scMngr==='upstart') {
    var uapi = new UpstartApi();
    uapi.enableElevation('');
    uapi.restart(svcName, {}, done);
  } else if (scMngr==='launchd') {
    if (opts.system) {
      delete opts.system;
      var lsaRoot = new LaunchdSimpleApi();
      lsaRoot.enableElevation('');
      return lsaRoot.restart(svcName, then)
    } else {
      return lsa.restart(svcName, then)
    }
  } else if (scMngr==='systemd') {
    if (opts.system) {
      delete opts.system;
      var sdsRoot = new SystemdApi();
      sdsRoot.enableElevation('');
      sdsRoot.restart(svcName, {}, then)
    } else {
      opts.user = true;
      sds.restart(svcName, {}, then)
    }
  }
}

function editFile (svcFile, done) {
  var tempName = temp.path();
  var currentContent = '';
  var read = sudoFs.createReadStream(svcFile)
  .on('error', done)
  .on('data', function (d) {
    currentContent += d.toString();
  });
  var write = fs.createWriteStream(tempName)
  .on('error', done)
  .on('close', function () {
    editor(tempName, function (code, sig) {
      var newContent = fs.readFileSync(tempName);
      if(newContent===currentContent) {
        done(null, null);
      } else {
        done(null, newContent);
      }
    })
  });
  read.pipe(write);
}

function getSvcPath(scMngr, svcName){
  var svcFile;
  if (scMngr==='sc') {
    var AppDirectory = require('appdirectory')
    var nsiPath = new (require('appdirectory'))(svcName).userData()
    svcFile = path.join(nsiPath, svcName + '.cmd');
  } else if (scMngr==='chkconfig') {
    svcFile = path.join('/etc/init.d/', svcName + '.sh');
  } else if (scMngr==='sysv') {
    svcFile = path.join('/etc/init.d/', svcName + '.sh');
  } else if (scMngr==='upstart') {
    svcFile = path.join('/etc/init/', svcName + '.conf');
  } else if (scMngr==='launchd') {
    svcFile = path.join(lsa.forgePath({domain: argv.system ? 'global' : 'user'}), svcName + '.plist');
  } else if (scMngr==='systemd') {
    svcFile = path.join(sds.forgePath({user: !argv.system}), svcName + '.service');
  }
  return svcFile;
}

module.exports = tail;
