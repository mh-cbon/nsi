var fs          = require('fs');
var path        = require('path')
var svcGen      = require('../lib/service-definition-generator.js')
var pkg         = require('../package.json');
var debug       = require('debug')(pkg.name);

var generate = function (argv, allDone) {
  var baseDir = argv.dir || argv.d || process.cwd();
  if (argv.dir || argv.d) baseDir = path.join(process.cwd(), baseDir);
  var fPath = path.join(baseDir, 'package.json');
  fs.access(fPath, fs.F_OK, function (err) {
    if (err) return allDone('The package.json file is missing at ' + fPath)
    var pkgInfo = require(fPath);
    if (!pkgInfo.scripts || !pkgInfo.scripts.start)
      return allDone('The current package.json is missing npm start script !');
    svcGen.fromPkgJson(pkgInfo, function (err, svcDef) {
      fs.readFile(path.join(__dirname, '..', 'template', 'nsi.js'), function (err, template) {
        template = template.toString().replace(/'!svcDef'/, JSON.stringify(svcDef, null, 2));
        fs.writeFile(path.join(baseDir, 'nsi.js'), template, allDone);
      })
    })
  })
}

module.exports = generate;
