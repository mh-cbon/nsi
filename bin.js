var fs          = require('fs')
var argv        = require('minimist')(process.argv.slice(2));
var pkg         = require('./package.json');
var debug       = require('debug')(pkg.name);

debug('argv %j', argv);

var action = argv['_'].shift().match(/([^/\\]+)$/)[1];

fs.exists(__dirname + '/bin/' + action + '.js', function (ex) {
  if(!ex) {
    console.error('Unknown action %s', action);
    process.exit(1)
  }
  require('./bin/' + action + '.js')(argv, function (err) {
    if (err) {
      console.error('An error has occured !')
      console.error(err);
      process.exit(1)
    }
  })
})
