var spawn       = require('child_process').spawn;
var fs          = require('fs')
var async       = require('async')
var yesNo       = require('../lib/yesno.js')
var npmInvoke   = require('../lib/npm-invoke.js')
var isPkgInst   = require('../lib/is-pkg-installed.js')
var whichSc     = require('@mh-cbon/which-service-manager');
var pkg         = require('../package.json');
var debug       = require('debug')(pkg.name);
var stdErrors   = require('../lib/std-errors.js');
var svcGen      = require('../lib/service-definition-generator.js')


var install = function (argv, allDone) {
  var name = pkgSource = argv['_'][0];

  if(!name) return allDone(stdErrors.wrongUsage("nsi install [package name]"))

  yesNo.auto = !!argv.yes || !!argv.y;

  var isPkgInstalled = false;
  var pkgInfo;
  var scMngr;
  var setupSource;
  var serviceDefinition;

  async.series([
    function (next) {
      if(argv.sysinit) {
        scMngr = argv.sysinit.toString();
        if (whichSc.sysInits.indexOf(scMngr)===-1)
          return next(stdErrors.unknownInitSytem(scMngr))
        console.log('You have decided to install service using "%s" service manager.', scMngr);
        next();
      } else {
        whichSc(function (err, serviceManager, bin) {
          if (err) return next(stdErrors.notFoundInitSytem());
          yesNo('I detected that you are running "' + serviceManager + '" service manager, is it correct ?', 'yes', function (err, answer) {
            if (answer==='no') return next(stdErrors.incorrectInitSytem());
            scMngr = serviceManager;
            next();
          })
        })
      }
    },
    function (next) {
      if (scMngr==='sysv') return next('Sorry this init system is not yet handled.')
    },
    function (next) {
      getNameFromADirectoryPackage(pkgSource, function (voidErr, pkgName) {
        if (voidErr) return next();
        name = pkgName;
        next();
      })
    },
    function (next) {
      isPkgInst(name, function (err, info) {
        if (err) isPkgInstalled = false;
        else pkgInfo = info;
        next();
      });
    },
    function (next) {
      if (isPkgInstalled) return next();
      yesNo('The package is not yet installed, would you like to install it now ?', 'yes', function (err, answer) {
        if (answer=='no') return next(stdErrors.pkgNotInstalled(name));

        var child = npmInvoke(['i', pkgSource, '-g'], {stdio: 'pipe'});
        child.stdout.pipe(process.stdout);
        child.stderr.pipe(process.stderr);
        child.on('close', function (code) {
          if (code!==0)
          return next(stdErrors.pkgNotInstallationFailed(name));
          isPkgInst(name, function (err, info) {
            if (err) return next(stdErrors.pkgNotInstalledProperly(name));
            pkgInfo = info;
            next();
          });
        })
      })
    },
    function (next) {
      isValidPackage(pkgInfo, function (err, source) {
        if (err) return next(stdErrors.pkgNotValidForAService(name));
        if (source==='start')
          console.log("I m going to generate the service definition from the start script")
        if (source==='bin')
          console.log("I m going to generate the service definition from the main bin")
        setupSource = source;
        debug('setupSource=%s', setupSource)
        next();
      });
    },
    function (next) {
      yesNo('You are about to setup a service for ' + name + ', do you agree ?', 'yes', function (err, answer) {
        if (answer==='no') return next(stdErrors.didNotAgreed())
        next();
      })
    },
    function (next) {
      var svcHandler;
      if (setupSource==='start') svcHandler = svcGen.fromPkgJson;
      else if (setupSource==='file') svcHandler = svcGen.fromNsiJs;
      else return next('Did find source definition')
      svcHandler(pkgInfo, function (err, svcDef) {
        svcDef.pkgName = svcDef.pkgName.match(/([^\/]+)$/)[1];
        svcDef.wd = pkgInfo.path;
        // keep this. need to document why.
        if (svcDef.start.bin==='node')
          svcDef.start.bin = process.argv[0];
        if (svcDef.reload && svcDef.reload.bin==='node')
          svcDef.reload.bin = process.argv[0];
        // keep this. need to document why.
        svcGen.runtimeEval(argv, svcDef, function (err) {
          if (err) return next(err);
          serviceDefinition = svcDef;
          next();
        })
      })
    },
    function (next) {
      testService(serviceDefinition, function (err) {
        if (!err) return next();
        console.error("Health check err\n", err);
        yesNo('Health check has failed ! Would you like to proceed anyway ?', 'yes', function (answer) {
          if (answer==='no') return next(stdErrors.healthCheckFailed(err))
          next();
        });
      });
    },
    function (next) {
      debug('serviceDefinition=%j', serviceDefinition);
      require('../interviews/' + scMngr + '.js')(serviceDefinition, next)
    },
    function (next) {
      if (!serviceDefinition.post_install) return next();
      serviceDefinition.post_install(argv, serviceDefinition, next);
    },
  ], function (err) {
    if(!err) console.log('All done!');
    allDone(err);
  })

}

module.exports = install;

function testService(serviceDefinition, then) {
  var start = serviceDefinition.start;
  debug('health check node=%s args=%s', start.bin, start.args);
  debug('health check env=%j', serviceDefinition.env);
  var child = spawn(start.bin, start.args, {cwd:serviceDefinition.wd, env: serviceDefinition.env || {}});
  var stdout = '';
  var stderr = '';
  var healthCheck;
  child.stdout.on('data', function (d) {
    stdout += d.toString();
  })
  child.stderr.on('data', function (d) {
    stderr += d.toString();
  })
  child.on('close', function (code) {
    if(healthCheck)
      then(healthCheck);
    else if(code===null)
      then((stdout+stderr).match(/throw err;|Error:/)?'return code='+code+'\n'+stdout+'\n'+stderr:null);
    else if(code!==0)
      then('return code='+code+'\n'+stdout+'\n'+stderr);
    else
      then(/* ?? */)
  });
  child.on('error', function (err) {
    healthCheck = err;
  });
  if (serviceDefinition.health_check) {
    serviceDefinition.health_check(serviceDefinition, function (err) {
      healthCheck = err;
      child.kill();
    })
  } else setTimeout(function () {
    child.kill();
  }, 500);
}

function isValidPackage(info, then) {
  debug('info.path=%j', info.path);
  fs.access(info.path + '/nsi.js', fs.OK, function (err) {
    var e;
    var source;
    if (!err) {
      source = 'file'
      return then(null, 'file');
    } else {
      if (info.scripts && info.scripts.start) {
        return then(null, 'start');
      } else {
        e = new Error('not installable')
        then(new Error('not installable'))
      }
    }
  })
}

function getNameFromADirectoryPackage (pkgPath, then) {
  fs.stat(pkgPath, function (err, stats) {
    if (err) return then(err);
    var name;
    var err;
    if (stats.isDirectory()) {
      try {
        var p = require(pkgSource + '/package.json')
        name = p.name;
      }catch(ex) {
        err = ex;
      }
    } else {
      err = new Error('not a directory')
    }
    then(err, name);
  });
}
