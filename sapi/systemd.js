
var SystemdApi  = require('@mh-cbon/systemd-simple-api');

var standardApi = function () {
  var sds = new SystemdApi();
  var sdsRoot = new SystemdApi();
  sdsRoot.enableElevation('');
  var that = this;
  that.start = function (serviceId, opts, then) {
    if (opts.system) {
      delete opts.system;
      return sdsRoot.start(serviceId, opts, then)
    } else {
      opts.user = true;
      return sds.start(serviceId, opts, then)
    }
  }
  that.stop = function (serviceId, opts, then) {
    if (opts.system) {
      delete opts.system;
      return sdsRoot.stop(serviceId, opts, then)
    } else {
      opts.user = true;
      return sds.stop(serviceId, opts, then)
    }
  }
  that.restart = function (serviceId, opts, then) {
    if (opts.system) {
      delete opts.system;
      return sdsRoot.restart(serviceId, opts, then)
    } else {
      opts.user = true;
      return sds.restart(serviceId, opts, then)
    }
  }
  that.reload = function (serviceId, opts, then) {
    if (opts.system) {
      delete opts.system;
      return sdsRoot.reload(serviceId, opts, then)
    } else {
      opts.user = true;
      return sds.reload(serviceId, opts, then)
    }
  }
  that.enable = function (serviceId, opts, then) {
    if (opts.system) {
      delete opts.system;
      return sdsRoot.enable(serviceId, opts, then)
    } else {
      opts.user = true;
      return sds.enable(serviceId, opts, then)
    }
  }
  that.disable = function (serviceId, opts, then) {
    if (opts.system) {
      delete opts.system;
      return sdsRoot.disable(serviceId, opts, then)
    } else {
      opts.user = true;
      return sds.disable(serviceId, opts, then)
    }
  }
  that.refresh = function (opts, then) {
    if (opts.system) {
      return sdsRoot.refresh(then)
    } else {
      return sds.refresh(then)
    }
  }
  that.list = function (opts, then) {
    if (opts.system) {
      delete opts.system;
      return sdsRoot.list(opts, then)
    } else {
      opts.user = true;
      return sds.list(opts, then)
    }
  }
  that.remove = function (serviceId, opts, then) {
    if (opts.system) {
      delete opts.system;
      return sdsRoot.stop(serviceId, opts, function (voidErr) {
        sdsRoot.disable(serviceId, opts, function (voidErr) {
          sdsRoot.uninstall({id: serviceId}, then);
        });
      })
    } else {
      opts.user = true;
      return sds.stop(serviceId, opts, function (voidErr) {
        sds.disable(serviceId, opts, function (voidErr) {
          sds.uninstall({id: serviceId, user: true}, then);
        });
      })
    }
  }
}

module.exports = standardApi;
