require('should');
var spawn = require('child_process').spawn;
var net = require('net')

describe('sapi fails', function () {
  this.timeout(20000);

  it('should fails to stop the server', function (done) {
    var args = [__dirname + '/../bin.js', 'stop','something-that-does-exist']
    if (process.env['SYSINIT']) args = args.concat(['--sysinit'], process.env['SYSINIT'])
    var child = spawn(process.argv[0], args, {stdio:'pipe'}).on('error', done);
    child.stdout.pipe(process.stderr);
    child.stderr.pipe(process.stderr);
    child.on('close', function (code) {
      code.should.eql(1)
      done();
    })
  })

  it('should fails to start the server', function (done) {
    var args = [__dirname + '/../bin.js', 'start','something-that-does-exist']
    if (process.env['SYSINIT']) args = args.concat(['--sysinit'], process.env['SYSINIT'])
    var child = spawn(process.argv[0], args, {stdio:'pipe'}).on('error', done)
    child.stdout.pipe(process.stderr);
    child.stderr.pipe(process.stderr);
    child.on('close', function (code) {
      code.should.eql(1)
      done();
    })
  })

  it('should fails to restart the server', function (done) {
    var args = [__dirname + '/../bin.js', 'restart','something-that-does-exist']
    if (process.env['SYSINIT']) args = args.concat(['--sysinit'], process.env['SYSINIT'])
    var child = spawn(process.argv[0], args, {stdio:'pipe'}).on('error', done)
    child.stdout.pipe(process.stderr);
    child.stderr.pipe(process.stderr);
    child.on('close', function (code) {
      code.should.eql(1)
      done();
    })
  })

  it('should fails to reload the server', function (done) {
    var args = [__dirname + '/../bin.js', 'reload','something-that-does-exist']
    if (process.env['SYSINIT']) args = args.concat(['--sysinit'], process.env['SYSINIT'])
    var child = spawn(process.argv[0], args, {stdio:'pipe'}).on('error', done)
    child.stdout.pipe(process.stderr);
    child.stderr.pipe(process.stderr);
    child.on('close', function (code) {
      code.should.eql(1)
      done();
    })
  })

  it('should fails to disable the service', function (done) {
    if (process.env['SYSINIT']==='systemd') return done(/* skipped as it fails to return a code !=0 */);
    var args = [__dirname + '/../bin.js', 'disable', 'something-that-does-exist']
    if (process.env['SYSINIT']) args = args.concat(['--sysinit'], process.env['SYSINIT'])
    var child = spawn(process.argv[0], args, {stdio:'pipe'}).on('error', done)
    child.stdout.pipe(process.stderr);
    child.stderr.pipe(process.stderr);
    child.on('close', function (code) {
      code.should.eql(1)
      done();
    })
  })

  it('should fails to enable the service', function (done) {
    if (process.env['SYSINIT']==='systemd') return done(/* skipped as it fails to return a code !=0 */);
    var args = [__dirname + '/../bin.js', 'enable', 'something-that-does-exist']
    if (process.env['SYSINIT']) args = args.concat(['--sysinit'], process.env['SYSINIT'])
    var child = spawn(process.argv[0], args, {stdio:'pipe'}).on('error', done)
    child.stdout.pipe(process.stderr);
    child.stderr.pipe(process.stderr);
    child.on('close', function (code) {
      code.should.eql(1)
      done();
    })
  })
})
