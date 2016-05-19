var spawn       = require('child_process').spawn;
var which       = require('which');
var inquirer    = require('inquirer')
var async       = require('async')
var yesNo       = require('../lib/yesno.js')
var quotedValue = require('../lib/quoted-value.js')
var pkg         = require('../package.json');
var debug       = require('debug')(pkg.name);
var debugChild  = require('../lib/debug-child.js');
var SystemdSimpleApi = require('@mh-cbon/systemd-simple-api');

var service = {
  user: true,
  id: null,
  properties: {
    install:[
      {
        name: 'WantedBy',
        value: 'default.target'
      }
    ],
    unit: [
      {
        name: 'After',
        value: 'default.target'
      }
    ],
    service: [
      {
        name: 'Restart',
        value: 'always'
      }
    ]
  }
}

var systemdInterview = function (opts, done) {
  async.series([
    function (next) {
      service.id = opts.pkgName;
      debug('service.id=%j', service.id);
      next();
    },
    function (next) {
      opts.description && service.properties.unit.push({
        name: 'Description',
        value: opts.description + (opts.author ? ' - ' + opts.author : '')
      })
      service.properties.service.push({
        name: 'WorkingDirectory',
        value: opts.wd
      })
      debug('WorkingDirectory=%j', opts.wd);
      next();
    },
    function (next) {
      opts.env && Object.keys(opts.env).forEach(function (name) {
        var val = quotedValue(name + '=' + opts.env[name]);
        service.properties.service.push({
          name: 'Environment',
          value: val
        })
        debug('Environment %s', val);
      })
      next();
    },
    function (next) {
      service.properties.service.push({
        name: 'StandardOutput',
        value: 'journal'
      })
      debug('StandardOutput journal');
      service.properties.service.push({
        name: 'StandardError',
        value: 'journal'
      })
      debug('StandardError journal');
      next();
    },
    function (next) {
      debug('generate start command=%j', opts.start);
      createInlineCommand (opts.start, function (err, cmd) {
        if (err) return next(err);
        service.properties.service.push({
          name: 'ExecStart',
          value: cmd
        })
        debug('ExecStart=%j', cmd);
        next();
      })
    },
    function (next) {
      if (!opts.reload) return next();
      debug('generate reload command=%j', opts.reload);
      createInlineCommand (opts.reload, function (err, cmd) {
        if (err) return next(err);
        service.properties.service.push({
          name: 'ExecReload',
          value: cmd
        })
        debug('ExecReload=%j', cmd);
        next();
      })
    },
    function (next) {
      debug('install service=%j', service)
      var sds = new SystemdSimpleApi();
      if (!service.user) {
        debug('enable elevation')
        sds.enableElevation('');
      }
      sds.install(service, function (err) {
        if (err) return next(err);
        debug('start service=%j', service.id);
        var start = sds.start(service.id, {user: !!service.user}, function () {
          var enable = sds.enable(service.id, {user: !!service.user}, next);
          debugChild('enable', enable);
        });
        debugChild('start', start);
      })
    },
    function (next) {
      next();
    },
  ], done)

}

function createInlineCommand (cmdInfo, then) {
  var exec = '';
  cmdInfo.args.forEach(function (arg) {
    exec += ' ' + quotedValue(arg);
  });
  debug('cmdInfo.bin=%s', cmdInfo.bin)
  which (cmdInfo.bin, function (err, p) {
    debug('err=%s', err);
    debug('cmdInfo.bin=%s', cmdInfo.bin)
    if (err) {
      if (cmdInfo.bin.match(/^node(\.exe)?/))
        p = process.argv[0]
      else return then(err);
    }
    exec = p + ' ' + exec;
    then(null, exec);
  })
}

module.exports = systemdInterview;
