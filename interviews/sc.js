var spawn       = require('child_process').spawn;
var path        = require('path');
var which       = require('which');
var inquirer    = require('inquirer')
var async       = require('async')
var yesNo       = require('../lib/yesno.js')
var pkg         = require('../package.json');
var debug       = require('debug')(pkg.name);
var SimpleScApi = require('@mh-cbon/sc-simple-api');

var rootSsa = new SimpleScApi();
rootSsa.enableElevation();
var ssa = new SimpleScApi();

var serviceId = '';
var cmd = '';

var scInterview = function (opts, done) {
  async.series([
    function (next) {
      if (opts.reload) {
        console.error("The service provides a reload command.")
        console.error("SC does not support reload feature.")
        console.error("Ignoring reload command.")
      }
      next();
    },
    function (next) {
      var AppDirectory = require('appdirectory')
      var nsiPath = new (require('appdirectory'))(pkg.name).userData()

      serviceId = opts.pkgName;
      var sOpts = {
        name: opts.pkgName,
        description: opts.description || '',
        author: opts.author,
        wd: opts.wd || '',
        stdout: path.join(nsiPath, serviceId + '.out'),
        stderr: path.join(nsiPath, serviceId + '.err'),
      }
      var cmdPath = path.join(nsiPath, serviceId + '.cmd');
      debug('cmdPath=%s', cmdPath);
      
      var cmd = ssa.generateCmdFile(opts.start.bin, opts.start.args, opts.env, sOpts)
      rootSsa.writeFile(cmdPath, cmd, function (err) {
        err && console.error(err);
        if (err) return next(err);
        debug('installing service');
        rootSsa.nssmInstall(serviceId, cmdPath, '', function (err2) {
          err2 && console.error(err2);
          if(err2) return next(err2);
          debug('configuring service auto start');
          rootSsa.nssmSet(serviceId, "Start", 'SERVICE_AUTO_START', function (err3) {
            err3 && console.error(err3);
            if(err3) return next(err3);
            debug('starting service');
            rootSsa.start(serviceId, [], next);
          })
        })
      })
    },
    function (next) {
      next();
    },
  ], done)

}

module.exports = scInterview;
