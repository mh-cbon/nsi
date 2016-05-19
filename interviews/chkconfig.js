var spawn         = require('child_process').spawn;
var which         = require('which');
var inquirer      = require('inquirer')
var async         = require('async')
var pkg           = require('../package.json');
var debug         = require('debug')(pkg.name);
var fs            = require('fs')
var getGroup      = require('../lib/get-group.js')
var yesNo         = require('../lib/yesno.js')
var quotedValue   = require('../lib/quoted-value.js')
var getUsername   = require('username');
var ChkconfigApi  = require('@mh-cbon/chkconfig-simple-api');
var confirmUserAndGroup  = require('../lib/confirm-user-and-group.js');

var chapi = new ChkconfigApi();
chapi.enableElevation('');

var serviceId   = '';
var initScript  = '';
var username    = '';
var groupname   = '';

var chapiInterview = function (svcDef, done) {
  async.series([
    function (next) {
      fs.readFile(__dirname + '/../template/sysv.sh', function (err, content) {
        if (err) return next(err);
        initScript = content.toString();
        next();
      })
    },
    function (next) {
      getUsername().then(u => {
        username = u;
        next()
      }).catch(next);
    },
    function (next) {
      getGroup(function (err, name) {
        if (err) return next(err);
        groupname = name;
        next();
      });
    },
    function (next) {
      // if (svcDef.prefer_user) username = svcDef.prefer_user;
      // if (svcDef.prefer_group) groupname = svcDef.prefer_group;
      confirmUserAndGroup(username, groupname, function (err, u, g) {
        username = u;
        groupname = g;
        next();
      })
    },
    function (next) {
      chapi.setupFile('/var/run/' + serviceId + '.pid', username, groupname, 0640, next)
    },
    function (next) {
      chapi.setupFile('/var/log/' + serviceId + '.log', username, groupname, 0640, next)
    },
    function (next) {
      serviceId = svcDef.pkgName;

      var start = '';
      start += svcDef.start.bin;
      svcDef.start.args.forEach(function (arg) {
        start += ' ' + quotedValue(arg);
      });
      start = start.replace(/"/g, '\\"');

      var reload = '';
      if (svcDef.reload) {
        reload = svcDef.reload.bin;
        svcDef.reload.args.forEach(function (arg) {
          reload += ' ' + quotedValue(arg);
        });
        reload = reload.replace(/"/g, '\\"');
      }

      initScript = initScript.replace(/!author/g, svcDef.author)
      initScript = initScript.replace(/!name/g, serviceId)
      initScript = initScript.replace(/!wd/g, svcDef.wd)
      initScript = initScript.replace(/!user/g, username)
      initScript = initScript.replace(/!cmd/g, start)
      initScript = initScript.replace(/!reload/g, reload)
      initScript = initScript.replace(/!pid/g, '/var/run/' + serviceId + '.pid')
      initScript = initScript.replace(/!stdout/g, '/var/log/' + serviceId + '.log')
      initScript = initScript.replace(/!stderr/g, '/var/log/' + serviceId + '.log')

      if(svcDef.description) {
        var description = '' + svcDef.description.replace(/\n/g, '\n\t')
        initScript = initScript.replace(/!description/g, description)
      }
      var env = 'ENV\n';
      svcDef.env && Object.keys(svcDef.env).forEach(function (name) {
        var v = svcDef.env[name];
        env += '' + name + '=' + quotedValue(v) + '\n'
      })
      initScript = initScript.replace(/!env/g, env)
      next();
    },
    function (next) {
      var service = {
        id: serviceId,
        content: initScript
      }
      debug('service install %s', serviceId);
      debug('service script %s', initScript);
      chapi.install(service, next);
    },
    function (next) {
      debug('service enable %s', serviceId);
      var child = chapi.enable(serviceId, {}, next);
      child.stdout.pipe(process.stderr);
      child.stderr.pipe(process.stderr);
    },
    function (next) {
      debug('service start %s', serviceId);
      var child = chapi.start(serviceId, next);
      child.stdout.pipe(process.stderr);
      child.stderr.pipe(process.stderr);
    },
  ], done)
}

module.exports = chapiInterview;
