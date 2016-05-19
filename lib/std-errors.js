var util = require('util');

function notFoundInitSytem () {
  var msg = '';
  msg += 'Sorry, I was not able to detect the service manager on your computer.';
  msg += '\nI cannot proceed.';
  msg += '\nSee you another time!';
  return msg;
}

function didNotAgreed () {
  var msg = '';
  msg += 'Ok, see you later!';
  return msg;
}

function pkgNotValidForAService (name) {
  var msg = '';
  msg += 'Package %s can not be installed as a service.';
  msg += '\nI cannot proceed.';
  msg += '\nSee you another time!';
  return util.format(msg, name);
}

function pkgNotInstalled (name) {
  var msg = '';
  msg += 'Package %s was not installed';
  return util.format(msg, name);
}

function pkgNotInstallationFailed (name) {
  var msg = '';
  msg += 'Package %s installation failed';
  return util.format(msg, name);
}

function pkgNotInstalledProperly (name) {
  var msg = '';
  msg += 'Package %s was not installed properly';
  return util.format(msg, name);
}

function incorrectInitSytem () {
  var msg = '';
  msg += 'Ok, I made a mistake!';
  msg += '\nI cannot proceed.';
  msg += '\nSee you another time!';
  return msg;
}

function unknownInitSytem (scMngr) {
  var msg = '';
  msg += 'Uknown init system "%s"';
  msg += '\nCannot proceed further.';
  msg += '\nKnown init systems are %s';
  return util.format(msg, name);
}

function healthCheckFailed (err) {
  var msg = '';
  msg += 'Health check has failed with message';
  msg += '\n%s';
  return util.format(msg, err);
}

function wrongUsage (usage, usageArgs) {
  usageArgs = usageArgs || [];
  usageArgs.unshift(usage);
  usageArgs.unshift(msg);
  var msg = '';
  msg += 'Wrong usage.';
  msg += '\nUsage:';
  msg += '\n%s';
  return util.format.apply(util, usageArgs);
}

module.exports = {
  notFoundInitSytem: notFoundInitSytem,
  wrongUsage: wrongUsage,
  unknownInitSytem: unknownInitSytem,
  incorrectInitSytem: incorrectInitSytem,
  pkgNotInstalledProperly: pkgNotInstalledProperly,
  pkgNotInstallationFailed: pkgNotInstallationFailed,
  pkgNotInstalled: pkgNotInstalled,
  pkgNotValidForAService: pkgNotValidForAService,
  didNotAgreed: didNotAgreed,
}
