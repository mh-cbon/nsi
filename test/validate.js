require('should');
var net = require('net')
var spawn = require('child_process').spawn;



describe('package validation', function () {
  this.timeout(50000);

  it('should validate the fake-package package', function (done) {
    var args = [__dirname + '/../bin.js', 'validate', __dirname + '/../utils/fake-package']
    if (process.env['SYSINIT']) args = args.concat(['--sysinit'], process.env['SYSINIT'])
    var child = spawn(process.argv[0], args, {stdio:'pipe'}).on('error', done);
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
      stdout.should.match(/The service will be installed from file/)
      code.should.eql(0)
      setTimeout(done, 2000);
    })
  })

  it('should validate the start-script package', function (done) {
    var args = [__dirname + '/../bin.js', 'validate', __dirname + '/../utils/start-script']
    if (process.env['SYSINIT']) args = args.concat(['--sysinit'], process.env['SYSINIT'])
    var child = spawn(process.argv[0], args, {stdio:'pipe'}).on('error', done);
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
      stdout.should.match(/The service will be installed from start/)
      code.should.eql(0)
      setTimeout(done, 2000);
    })
  })

  it('should not validate a package without npm start script or service file', function (done) {
    var args = [__dirname + '/../bin.js', 'validate', '@mh-cbon/launchd-simple-api']
    if (process.env['SYSINIT']) args = args.concat(['--sysinit'], process.env['SYSINIT'])
    var child = spawn(process.argv[0], args, {stdio:'pipe'}).on('error', done);
    child.stdout.pipe(process.stderr);
    child.stderr.pipe(process.stderr);
    child.on('close', function (code) {
      code.should.eql(1)
      setTimeout(done, 2000);
    })
  })

  it('should not validate a package which does not exist', function (done) {
    var args = [__dirname + '/../bin.js', 'validate', '@mh-cbon/no-such-package']
    if (process.env['SYSINIT']) args = args.concat(['--sysinit'], process.env['SYSINIT'])
    var child = spawn(process.argv[0], args, {stdio:'pipe'}).on('error', done);
    child.stdout.pipe(process.stderr);
    child.stderr.pipe(process.stderr);
    child.on('close', function (code) {
      code.should.eql(1)
      setTimeout(done, 2000);
    })
  })




})
