require('should');
var spawn = require('child_process').spawn;
var net = require('net')

describe('install', function () {
  this.timeout(60000);

  it('should install the service from a service file', function (done) {
    var args = [__dirname + '/../bin.js', 'install', __dirname + '/../utils/fake-package/', '-y']
    if (process.env['SYSINIT']) args = args.concat(['--sysinit'], process.env['SYSINIT'])
    var child = spawn(process.argv[0], args, {stdio:'pipe'})
    child.stdout.pipe(process.stderr);
    child.stderr.pipe(process.stderr);
    var stdout = '';
    child.stdout.on('data', function (d) {
      stdout += '' + d;
    })
    var stderr = '';
    child.stderr.on('data', function (d) {
      stderr += '' + d;
    })
    child.on('close', function (code) {
      code.should.eql(0)
      stdout.should.match(/All done!/)
      setTimeout(done, 2500)
    })
  })

  it('should connect to the server installed from a service file', function (done) {
    var client = net.createConnection({port: 8090}, () => {
      client.end();
      done();
    });
    client.on('error', done);
  })

  it('should install the service from an npm start script', function (done) {
    var args = [__dirname + '/../bin.js', 'install', __dirname + '/../utils/start-script/', '-y']
    if (process.env['SYSINIT']) args = args.concat(['--sysinit'], process.env['SYSINIT'])
    var child = spawn(process.argv[0], args, {stdio:'pipe'})
    var stdout = '';
    var stderr = '';
    child.stdout.pipe(process.stderr);
    child.stderr.pipe(process.stderr);
    child.stdout.on('data', function (d) {
      stdout += '' + d;
    })
    child.stderr.on('data', function (d) {
      stderr += '' + d;
    })
    child.on('close', function (code) {
      code.should.eql(0)
      stdout.should.match(/All done!/)
      setTimeout(done, 2500)
    })
  })

  it('should connect to the server installed from an npm start script', function (done) {
    var client = net.createConnection({port: 8091}, () => {
      client.end();
      done();
    });
    client.on('error', done);
  })
})
