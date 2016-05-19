var spawn       = require('child_process').spawn;
var fs          = require('fs')
var async       = require('async')
var yesNo       = require('../lib/yesno.js')
var cLineParser = require('cline-parser');
var npmInvoke   = require('../lib/npm-invoke.js')
var isPkgInst   = require('../lib/is-pkg-installed.js')
var whichSc     = require('@mh-cbon/which-service-manager');
var pkg         = require('../package.json');
var debug       = require('debug')(pkg.name);
var stdErrors   = require('../lib/std-errors.js');


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
      if (setupSource==='start')
        serviceDefinition = serviceDefinitionFromStartScript(pkgInfo)
      else if (setupSource==='file')
        serviceDefinition = serviceDefinitionFromFile(pkgInfo);
      else return next('Did find source definition')
      serviceDefinition.pkgName = serviceDefinition.pkgName.match(/([^\/]+)$/)[1];
      serviceDefinition.wd = pkgInfo.path;
      evaluteServiceDefinitionQs(argv, serviceDefinition, next)
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

function evaluteServiceDefinitionQs (argv, serviceDefinition, then) {
  var todos = [];
  if (serviceDefinition.start)
    todos = todos.concat(evaluteServiceArgs(argv, serviceDefinition, serviceDefinition.start.args))
  if (serviceDefinition.reload)
    todos = todos.concat(evaluteServiceArgs(argv, serviceDefinition, serviceDefinition.reload.args))
  if (serviceDefinition.env)
    todos = todos.concat(evaluteServiceEnvs(argv, serviceDefinition, serviceDefinition.env))
  debug('todos.length=%j', todos.length);
  if (todos.length) console.log("Let s now configure options for the module");
  return async.series(todos, then)
}

function evaluteServiceArgs (argv, serviceDefinition, args){
  var todos = [];
  args.forEach(function (arg, index) {
    if (typeof(arg)==='function') {
      todos.push(function (done) {
        debug('evalute.args index=%j', index);
        arg(argv, serviceDefinition, function (val) {
          args[index] = val.toString();
          debug('evalute.args val=%j', val.toString());
          done();
        })
      })
    } else {
      args[index] = arg.toString()
    }
  })
  return todos;
}

function evaluteServiceEnvs (argv, serviceDefinition, envs){
  var todos = [];
  Object.keys(envs).forEach(function (name, index) {
    var env = envs[name];
    if (typeof(env)==='function') {
      todos.push(function (done) {
        debug('evalute.env name=%j', name);
        env(argv, serviceDefinition, function (val) {
          envs[name] = val.toString();
          debug('evalute.env val=%j', val.toString());
          done();
        })
      })
    } else {
      envs[name] = env.toString();
    }
  })
  return todos;
}

function serviceDefinitionFromFile (pkgInfo) {
  var serviceDefinition = require(pkgInfo.path + '/nsi.js');
  if (serviceDefinition.start.bin==='node')
    serviceDefinition.start.bin = process.argv[0];
  if (!serviceDefinition.name)
    serviceDefinition.pkgName = pkgInfo.name;
  return serviceDefinition;
}

function serviceDefinitionFromStartScript (pkgInfo) {
  var p = cLineParser(pkgInfo.scripts.start);
  debug('p=%j', p)
  var serviceDefinition = {
    pkgName: pkgInfo.name,
    author: pkgInfo.author && pkgInfo.author.name,
    description: pkgInfo.description,
    start: {
      bin: p.prg,
      args: p.args
    },
    env: {},
  }
  if (serviceDefinition.start.bin==='node')
    serviceDefinition.start.bin = process.argv[0];
  return serviceDefinition;
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
