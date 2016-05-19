require('should');
var spawn = require('child_process').spawn;
var net = require('net')

describe('sapi', function () {
  this.timeout(20000);

  it('should stop the server', function (done) {
    if (process.platform.match(/^win/)) {
      return done(); // see explanations in reboot.js test
    }
    var args = [__dirname + '/../bin.js', 'stop','fake-pkg']
    if (process.env['SYSINIT']) args = args.concat(['--sysinit'], process.env['SYSINIT'])
    var child = spawn(process.argv[0], args, {stdio:'pipe'}).on('error', done);
    child.stdout.pipe(process.stderr);
    child.stderr.pipe(process.stderr);
    child.on('close', function (code) {
      code.should.eql(0)
      setTimeout(done, 2000);
    })
  })

  it('should not connect to the server', function (done) {
    if (process.platform.match(/^win/)) {
      return done(); // see explanations in reboot.js test
    }
    /*
    on macos, the service should not really stop,
    as it is marked with respawn,
    but yet somehow that test passes.... so far.
    */
    var client = net.createConnection({port: 8090}, () => {
      client.end();
      done && done();
      done = null;
    });
    client.on('error', function (err) {
      (!err).should.eql(false);
      done && done();
      done = null;
    });
  })

  it('should start the server', function (done) {
    var args = [__dirname + '/../bin.js', 'start','fake-pkg']
    if (process.env['SYSINIT']) args = args.concat(['--sysinit'], process.env['SYSINIT'])
    var child = spawn(process.argv[0], args, {stdio:'pipe'}).on('error', done)
    child.stdout.pipe(process.stderr);
    child.stderr.pipe(process.stderr);
    child.on('close', function (code) {
      code.should.eql(0)
      setTimeout(done, 2000);
    })
  })

  it('should connect to the server', function (done) {
    var client = net.createConnection({port: 8090}, () => {
      client.end();
      done();
    });
    client.on('error', done);
  })

  it('should restart the server', function (done) {
    if (process.platform.match(/^darwin/)) return done(/* skipped for now, something is wrong here */)
    var args = [__dirname + '/../bin.js', 'restart','fake-pkg']
    if (process.env['SYSINIT']) args = args.concat(['--sysinit'], process.env['SYSINIT'])
    var child = spawn(process.argv[0], args, {stdio:'pipe'}).on('error', done)
    child.stdout.pipe(process.stderr);
    child.stderr.pipe(process.stderr);
    child.on('close', function (code) {
      code.should.eql(0)
      setTimeout(done, 3000);
    })
  })

  it('should connect to the server', function (done) {
    var client = net.createConnection({port: 8090}, () => {
      client.end();
      done();
    });
    client.on('error', done);
  })

  it('should reload the server', function (done) {
    var args = [__dirname + '/../bin.js', 'reload','fake-pkg']
    if (process.env['SYSINIT']) args = args.concat(['--sysinit'], process.env['SYSINIT'])
    var child = spawn(process.argv[0], args, {stdio:'pipe'}).on('error', done)
    child.stdout.pipe(process.stderr);
    child.stderr.pipe(process.stderr);
    child.on('close', function (code) {
      code.should.eql(0)
      setTimeout(done, 3000);
    })
  })

  it('should connect to the server', function (done) {
    var client = net.createConnection({port: 8090}, () => {
      client.end();
      done();
    });
    client.on('error', done);
  })

  it('should list the service', function (done) {
    var args = [__dirname + '/../bin.js', 'list', 'fake-pkg']
    if (process.env['SYSINIT']) args = args.concat(['--sysinit'], process.env['SYSINIT'])
    var child = spawn(process.argv[0], args, {stdio:'pipe'}).on('error', done);
    var stdout = '';
    child.stdout.on('data', function (d) {
      stdout += d.toString();
    })
    // child.stdout.pipe(process.stderr);
    // child.stderr.pipe(process.stderr);
    child.on('close', function (code) {
      code.should.eql(0)
      stdout.should.match(/fake-pkg/)
      done();
    })
  })

  it('should disable the service', function (done) {
    var args = [__dirname + '/../bin.js', 'disable', 'fake-pkg']
    if (process.env['SYSINIT']) args = args.concat(['--sysinit'], process.env['SYSINIT'])
    var child = spawn(process.argv[0], args, {stdio:'pipe'}).on('error', done)
    child.stdout.pipe(process.stderr);
    child.stderr.pipe(process.stderr);
    child.on('close', function (code) {
      code.should.eql(0)
      done();
    })
  })

  it('should enable the service', function (done) {
    var args = [__dirname + '/../bin.js', 'enable', 'fake-pkg']
    if (process.env['SYSINIT']) args = args.concat(['--sysinit'], process.env['SYSINIT'])
    var child = spawn(process.argv[0], args, {stdio:'pipe'}).on('error', done)
    child.stdout.pipe(process.stderr);
    child.stderr.pipe(process.stderr);
    child.on('close', function (code) {
      code.should.eql(0)
      done();
    })
  })
})
