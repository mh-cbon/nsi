
var ChkconfigApi  = require('@mh-cbon/chkconfig-simple-api');

var standardApi = function () {
  var chapi = new ChkconfigApi();
  chapi.enableElevation('');
  var that = this;
  that.start = function (serviceId, opts, then) {
    return chapi.start(serviceId, then)
  }
  that.stop = function (serviceId, opts, then) {
    return chapi.stop(serviceId, then)
  }
  that.restart = function (serviceId, opts, then) {
    return chapi.restart(serviceId, then)
  }
  that.reload = function (serviceId, opts, then) {
    return chapi.reload(serviceId, then)
  }
  that.enable = function (serviceId, opts, then) {
    return chapi.enable(serviceId, opts, then)
  }
  that.disable = function (serviceId, opts, then) {
    return chapi.disable(serviceId, opts, then)
  }
  that.refresh = function (opts, then) {
    then && then(new Error('unhandled operation'))
  }
  that.list = function (opts, then) {
    return chapi.list(opts, then)
  }
  that.remove = function (serviceId, opts, then) {
    chapi.stop(serviceId, function (voidErr) {
      chapi.disable(serviceId, opts, function (voidErr) {
        chapi.del(serviceId, function (voidErr) {
          chapi.uninstall({id: serviceId, override: !!opts.override}, then);
        });
      });
    })
  }
}

module.exports = standardApi;
