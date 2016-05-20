
var pkg         = require('../package.json');
var debug       = require('debug')(pkg.name);
var cLineParser = require('cline-parser');
var async       = require('async')

var fromPkgJson = function (pkgInfo, then) {
  var p = cLineParser(pkgInfo.scripts.start);
  debug('p=%j', p);
  var serviceDefinition = {
    nsiversion:   pkg.version.toString().replace(/([0-9]+)$/, 'x'),
    pkgName:      pkgInfo.name,
    author:       pkgInfo.author && pkgInfo.author.name,
    description:  pkgInfo.description,
    start: {
      bin:  p.prg,
      args: p.args
    },
    env: {},
  }
  then(null, serviceDefinition);
}

var fromNsiJs = function (pkgInfo, then) {
  var serviceDefinition = require(pkgInfo.path + '/nsi.js');
  if (!serviceDefinition.name)
    serviceDefinition.pkgName = pkgInfo.name;
  then(null, serviceDefinition);
}

var runtimeEval = function (argv, serviceDefinition, then) {
  var todos = [];
  if (serviceDefinition.start)
    todos = todos.concat(evalArgs(argv, serviceDefinition, serviceDefinition.start.args))
  if (serviceDefinition.reload)
    todos = todos.concat(evalArgs(argv, serviceDefinition, serviceDefinition.reload.args))
  if (serviceDefinition.env)
    todos = todos.concat(evalEnvs(argv, serviceDefinition, serviceDefinition.env))
  debug('todos.length=%j', todos.length);
  if (todos.length) console.log("Let s now configure options for the module");
  return async.series(todos, then)
}

function evalArgs (argv, serviceDefinition, args){
  var todos = [];
  args.forEach(function (arg, index) {
    if (typeof(arg)==='function') {
      todos.push(function (done) {
        debug('evalute.args index=%j', index);
        arg(argv, serviceDefinition, function (val) {
          args[index] = val.toString();
          debug('evalute.args val=%j', val.toString());
          done();
        })
      })
    } else {
      args[index] = arg.toString()
    }
  })
  return todos;
}

function evalEnvs (argv, serviceDefinition, envs){
  var todos = [];
  Object.keys(envs).forEach(function (name, index) {
    var env = envs[name];
    if (typeof(env)==='function') {
      todos.push(function (done) {
        debug('evalute.env name=%j', name);
        env(argv, serviceDefinition, function (val) {
          envs[name] = val.toString();
          debug('evalute.env val=%j', val.toString());
          done();
        })
      })
    } else {
      envs[name] = env.toString();
    }
  })
  return todos;
}

module.exports = {
  fromPkgJson:  fromPkgJson,
  fromNsiJs:    fromNsiJs,
  runtimeEval:  runtimeEval,
  evalArgs:     evalArgs,
  evalEnvs:     evalEnvs,
}
