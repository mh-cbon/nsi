
var LaunchdSimpleApi = require('@mh-cbon/launchd-simple-api')

var standardApi = function () {
  var lsa = new LaunchdSimpleApi();
  var lsaRoot = new LaunchdSimpleApi();
  lsaRoot.enableElevation('');
  var that = this;
  that.start = function (serviceId, opts, then) {
    if (opts.system) {
      delete opts.system;
      return lsaRoot.start(serviceId, then)
    } else {
      return lsa.start(serviceId, then)
    }
  }
  that.stop = function (serviceId, opts, then) {
    if (opts.system) {
      delete opts.system;
      return lsaRoot.stop(serviceId, then)
    } else {
      return lsa.stop(serviceId, then)
    }
  }
  that.restart = function (serviceId, opts, then) {
    if (opts.system) {
      delete opts.system;
      return lsaRoot.restart(serviceId, then)
    } else {
      return lsa.restart(serviceId, then)
    }
  }
  that.reload = function (serviceId, opts, then) {
    return that.restart(serviceId, opts, then)
  }
  that.enable = function (serviceId, opts, then) {
    if (opts.system) {
      delete opts.system;
      return lsaRoot.load(serviceId, opts, then)
    } else {
      return lsa.load(serviceId, opts, then)
    }
  }
  that.disable = function (serviceId, opts, then) {
    if (opts.system) {
      delete opts.system;
      return lsaRoot.unload(serviceId, opts, then)
    } else {
      return lsa.unload(serviceId, opts, then)
    }
  }
  that.refresh = function (opts, then) {
    then && then(new Error('unhandled operation'))
  }
  that.list = function (opts, then) {
    if (opts.system) {
      delete opts.system;
      return lsaRoot.list(opts, then)
    } else {
      return lsa.list(opts, then)
    }
  }
  that.remove = function (serviceId, opts, then) {
    if (opts.system) {
      delete opts.system;
      return lsaRoot.unload(serviceId, opts, function (voidErr) {
        lsaRoot.uninstall(serviceId, then);
      })
    } else {
      return lsa.unload(serviceId, opts, function (voidErr) {
        lsa.uninstall(serviceId, then);
      })
    }
  }
}

module.exports = standardApi;
