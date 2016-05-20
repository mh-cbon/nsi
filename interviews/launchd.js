var spawn       = require('child_process').spawn;
var which       = require('which');
var path        = require('path');
var inquirer    = require('inquirer')
var async       = require('async')
var pkg         = require('../package.json');
var debug       = require('debug')(pkg.name);
var osHomedir   = require('os-homedir');
var yesNo       = require('../lib/yesno.js');
var LaunchdSimpleApi = require('@mh-cbon/launchd-simple-api');

var lsa = new LaunchdSimpleApi();
var lsaRoot = new LaunchdSimpleApi();
lsaRoot.enableElevation('');

var service = {
  domain: 'user',
  jobType: 'daemon',
  plist: {
    Label: '',
    Author: '',
    RootDirectory: '',
    Description: '',
    StandardOutPath: '',
    StandardErrorPath: '',
    ProgramArguments: [],
    RunAtLoad: true,
    KeepAlive: true,
    EnvironmentVariables: {}
  }
}
var username    = '';
var groupname   = '';

var launchdInterview = function (opts, done) {
  async.series([
    function (next) {
      service.plist.Label = opts.pkgName;
      if (opts.description)
        service.plist.Description = opts.description;
      if (opts.author)
        service.plist.Author = opts.author;
      service.plist.RootDirectory = opts.wd;
      service.plist.WorkingDirectory = opts.wd;
      opts.env && Object.keys(opts.env).forEach(function (name) {
        service.plist.EnvironmentVariables[name] = opts.env[name]
      })
      next();
    },
    function (next) {
      which(opts.start.bin, function (err, p) {
        if (err) return next(err);
        service.plist.ProgramArguments.push(p)
        opts.start.args.forEach(function (arg) {
          service.plist.ProgramArguments.push(arg)
        });
        next();
      })
    },
    function (next) {
      if (opts.reload) {
        console.error("The service provides a reload command.")
        console.error("Launchd does not support reload feature.")
        console.error("Ignoring reload command.")
      }
      next();
    },
    function (next) {
      service.plist.StandardOutPath = lsa.forgeStdLogPath(service) + service.plist.Label+ ".log";
      service.plist.StandardErrorPath = lsa.forgeStdLogPath(service) + service.plist.Label + ".log";
      debug('service=%j', service)
      next()
    },
    function (next) {
      if (service.domain==='user') lsa.install(service, next)
      else lsaRoot.install(service, next)
    },
    function (next) {
      var child;
      if (service.domain==='user') child = lsa.load(service.plist.Label, {e:true}, next)
      else child = lsaRoot.load(service.plist.Label, {e:true}, next)
      child && child.stderr && child.stderr.pipe(process.stderr);
      child && child.stdout && child.stdout.pipe(process.stdout);
    },
    function (next) {
      var child;
      if (service.domain==='user') child = lsa.start(opts.pkgName, next)
      else child = lsaRoot.start(opts.pkgName, next)
      child && child.stderr && child.stderr.pipe(process.stderr);
      child && child.stdout && child.stdout.pipe(process.stdout);
    },
    function (next) {
      next();
    },
  ], done)

}

module.exports = launchdInterview;
