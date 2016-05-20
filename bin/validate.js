var spawn       = require('child_process').spawn;
var fs          = require('fs')
var path        = require('path')
var async       = require('async')
var isPkgInst   = require('../lib/is-pkg-installed.js')
var whichSc     = require('@mh-cbon/which-service-manager');
var pkg         = require('../package.json');
var debug       = require('debug')(pkg.name);
var smthngToPkg = require('@mh-cbon/pkg-source-to-pkg-json')
var stdErrors   = require('../lib/std-errors.js');

var validate = function (argv, allDone) {
  var name = pkgSource = argv['_'][0];

  if(!name)
    return allDone(stdErrors.wrongUsage("nsi validate [package name]"));

  var isFromDir;
  var pkgJson;
  var pkgPath;
  var source;

  async.series([
    function (next) {
      whichSc(function (err, serviceManager, bin) {
        if (err) {
          console.log('✖ Your init system is not found');
          return next();
        }
        if (serviceManager==='sysv')
          return next('✖ Sorry this init system is not yet handled.');

        console.log('✓ Your init system is %s', serviceManager);
        next();
      })
    },
    function (next) {
      smthngToPkg(pkgSource, {}, function (err, json, dir) {
        if (err) {
          console.log('✖ The package %s was not found.', pkgSource)
          return next('fatal error');
        }
        pkgJson = json;
        pkgPath = path.dirname(dir);
        next();
      })
    },
    function (next) {
      isPkgInst(pkgJson.name, function (err, info) {
        if (err) {
          console.log('! The package %s is not yet installed, it will be installed during the service setup.', pkgSource)
          return next();
        }
        next();
      });
    },
    function (next) {
      debug('pkgPath=%s', pkgPath);
      if (fs.existsSync(pkgPath + '/nsi.js')){
        source = 'file'
      } else if (pkgJson.scripts && pkgJson.scripts.start) {
        source = 'start'
      }
      if (source) {
        console.log('✓ The service will be installed from %s.', source)
        next();
      } else{
        console.log('✖ The package cannot be installed, it does not provide a nsi.js file, a start script, or a bin command.')
        next('fatal error');
      }
    },
    function (next) {
      if (source==="file") {
        var svcDef = require(pkgPath + '/nsi.js');
        var isValid = true;
        if(!svcDef) {
          isValid = false;
          console.log('✖ The service definition did not export the definition object.')
        }else {
          if(!svcDef.nsiversion) {
            isValid = false;
            console.log('✖ The service definition is missing "nsiversion" field.')
          }
          if(!svcDef.start) {
            isValid = false;
            console.log('✖ The service definition is missing "start" field.')
          } else {
            if(!svcDef.start.bin) {
              isValid = false;
              console.log('✖ The service definition is missing "start.bin" field.')
            }
          }
        }
      }
      if (!isValid) return next('This package ca nt be installed as a service');
      console.log('Success ! You can install this package as a service !')
      next();
    },
  ], allDone)
}

module.exports = validate;
