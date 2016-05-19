var spawn       = require('child_process').spawn;
var which       = require('which');
var inquirer    = require('inquirer')
var async       = require('async')
var yesNo       = require('../lib/yesno.js')
var pkg         = require('../package.json');
var quotedValue = require('../lib/quoted-value.js')
var debug       = require('debug')(pkg.name);
var UpstartApi  = require('@mh-cbon/upstart-simple-api');
var getUsername = require('username');
var getGroup    = require('../lib/get-group.js')

var uapiRoot = new UpstartApi();
uapiRoot.enableElevation('');

var service = {
  id: null,
  stanzas: []
}
var username;
var groupname;

var upstartInterview = function (opts, done) {
  async.series([
    function (next) {
      service.id = opts.pkgName;
      debug('service.id=%j', service.id);
      next();
    },
    function (next) {
      opts.author && service.stanzas.push({
        name: 'start',
        value: 'on runlevel [2345]'
      })
      opts.author && service.stanzas.push({
        name: 'author',
        value: opts.author
      })
      service.stanzas.push({
        name: 'chdir',
        value: opts.wd
      })
      service.stanzas.push({
        name: 'respawn',
        value: ''
      })
      service.stanzas.push({
        name: 'respawn',
        value: 'limit 5 30'
      })
      debug('author=%j', opts.author);
      debug('chdir=%j', opts.wd);
      next();
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
      opts.env && Object.keys(opts.env).forEach(function (name) {
        var val = quotedValue(opts.env[name]);
        service.stanzas.push({
          name: 'env',
          value: name + '=' + val
        })
        debug('Environment %s=%j', name, val);
      })
      next();
    },
    function (next) {
      createInlineCommand(service.id, username, opts.start, function (err, exec) {
        if (err) return next(err);
        service.stanzas.push({
          name: 'exec',
          value: exec
        })
        debug('exec=%j', exec);
        next();
      });
    },
    function (next) {
      debug('install service=%j', service)
      uapiRoot.install(service, function (err) {
        if (err) return next(err);
        uapiRoot.setupLogFile('/var/log/' + service.id + '.log', username, groupname, next)
      })
    },
    function (next) {
      debug('reload configuration');
      uapiRoot.reloadConfiguration({}, next)
    },
    function (next) {
      debug('start service=%j', service.id);
      uapiRoot.start(service.id, {}, next)
    },
    function (next) {
      next();
    },
  ], done)
}

function createInlineCommand (serviceId, username, cmdInfo, then) {
  var exec = '';
  cmdInfo.args.forEach(function (arg) {
    exec += ' ' + quotedValue(arg);
  });
  debug('cmdInfo.bin=%s', cmdInfo.bin)
  which (cmdInfo.bin, function (err, p) {
    debug('err=%s', err);
    if (err) {
      if (cmdInfo.bin.match(/^node(\.exe)?/))
        p = process.argv[0]
      else return then(err);
    }

    exec = p + ' ' + exec;
    exec = 'sudo -u ' + username + ' ' + exec;
    exec += ' 1> /var/log/' + serviceId + '.log'
    exec += ' 2> /var/log/' + serviceId + '.log'

    debug('exec=%j', exec);
    then(null, exec);
  })
}

module.exports = upstartInterview;
