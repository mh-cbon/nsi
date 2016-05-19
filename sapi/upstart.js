
var UpstartApi  = require('@mh-cbon/upstart-simple-api');

var standardApi = function () {
  var uapi = new UpstartApi();
  uapi.enableElevation('');
  var that = this;
  that.start = function (serviceId, opts, then) {
    return uapi.start(serviceId, opts, then)
  }
  that.stop = function (serviceId, opts, then) {
    return uapi.stop(serviceId, opts, then)
  }
  that.restart = function (serviceId, opts, then) {
    return uapi.restart(serviceId, opts, then)
  }
  that.reload = function (serviceId, opts, then) {
    return uapi.reload(serviceId, opts, then)
  }
  that.enable = function (serviceId, opts, then) {
    return uapi.enable(serviceId, opts, then)
  }
  that.disable = function (serviceId, opts, then) {
    return uapi.disable(serviceId, opts, then)
  }
  that.refresh = function (opts, then) {
    return uapi.reloadConfiguration(opts, then)
  }
  that.list = function (opts, then) {
    return uapi.list(opts, then)
  }
  that.remove = function (serviceId, opts, then) {
    return uapi.stop(serviceId, opts, function (voidErr) {
      uapi.disable(serviceId, opts, function (voidErr) {
        uapi.uninstall({id: serviceId}, then);
      });
    })
  }
}

module.exports = standardApi;
