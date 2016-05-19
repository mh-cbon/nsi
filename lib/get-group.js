var spawn = require('child_process').spawn;

var getGroup = function (then) {
  var stdout = '';
  var stderr = '';
  var child = spawn('id', ['-gn'])
  .on('error', function (err) {
    then && then(err);
    next = null;
  })
  .on('close', function (code) {
    if (code!==0) return next && next(new Error(stdout+stderr))
    groupname = stdout.replace(/\s+$/, '');
    then && then(null, groupname);
  });
  child.stdout.on('data', function (d) { stdout += d.toString(); })
  child.stderr.on('data', function (d) { stderr += d.toString(); })
}

module.exports = getGroup;
