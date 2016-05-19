
var ScSimpleApi  = require('@mh-cbon/sc-simple-api');

var standardApi = function () {
  var ssa = new ScSimpleApi();
  ssa.enableElevation('');

  var that = this;
  that.start = function (serviceId, opts, then) {
    return ssa.start(serviceId, [], then)
  }
  that.stop = function (serviceId, opts, then) {
    return ssa.stop(serviceId, then)
  }
  that.restart = function (serviceId, opts, then) {
    return ssa.restart(serviceId, [], then);
  }
  that.reload = function (serviceId, opts, then) {
    return that.restart(serviceId, [], then);
  }
  that.enable = function (serviceId, opts, then) {
    return ssa.nssmSet(serviceId, "Start", 'SERVICE_AUTO_START', then)
  }
  that.disable = function (serviceId, opts, then) {
    return ssa.nssmSet(serviceId, "Start", 'SERVICE_DISABLED', then)
  }
  that.refresh = function (opts, then) {
    then && then(new Error('unhandled operation'))
  }
  that.list = function (opts, then) {
    if(!opts) opts = {};
    if(!opts.state) opts.state = 'all';
    return ssa.list(opts, then)
  }
  that.remove = function (serviceId, opts, then) {
    ssa.stop(serviceId, function (voidErr) {
      that.disable(serviceId, opts, function (voidErr) {
        ssa.uninstall({id: serviceId}, then);
      });
    })
  }
}

module.exports = standardApi;
