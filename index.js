
module.exports = {
  enable:     require('./bin/enable.js'),
  disable:    require('./bin/disable.js'),
  install:    require('./bin/install.js'),
  list:       require('./bin/list.js'),
  start:      require('./bin/start.js'),
  stop:       require('./bin/stop.js'),
  refresh:    require('./bin/refresh.js'),
  reload:     require('./bin/reload.js'),
  restart:    require('./bin/restart.js'),
  remove:     require('./bin/remove.js'),
  validate:   require('./bin/validate.js'),

  chkconfig:  require('./sapi/chkconfig.js'),
  launchd:    require('./sapi/launchd.js'),
  sc:         require('./sapi/sc.js'),
  systemd:    require('./sapi/systemd.js'),
  upstart:    require('./sapi/upstart.js'),
};
