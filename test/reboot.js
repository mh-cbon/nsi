require('should');
var net = require('net')
var spawn = require('child_process').spawn;



describe('system reboot', function () {
  this.timeout(50000);

  if (process.platform.match(/^win/)) {
    /*
    On windows, the test needs to start the service manually.

    The reason is:
    the service is configured with this commande line
        \\vboxsrv\vagrant\node_modules\@mh-cbon\nssm-prebuilt\prebuilt\nssm-2.24\win64\nssm.exe

    But, '\\vboxsrv\vagrant' is a shared folder mounter by vagrant AFTER the boot sequence,
    Thus, when the systems starts, it tries to start the service, but face an error such :
        The fake-pkg service failed to start due to the following error:
        The system cannot find the file specified.

    Last note, use of 'SERVICE_DELAYED_START' start mode is useless, as the service will
    start at undefined point in the time. ... windows.
    */

    it('should start the server installed from a service file', function (done) {
      var args = [__dirname + '/../bin.js', 'start','fake-pkg']
      if (process.env['SYSINIT']) args = args.concat(['--sysinit'], process.env['SYSINIT'])
      var child = spawn(process.argv[0], args, {stdio:'pipe'}).on('error', done);
      child.stdout.pipe(process.stderr);
      child.stderr.pipe(process.stderr);
      child.on('close', function (code) {
        code.should.eql(0)
        setTimeout(done, 2000);
      })
    })

    it('should start the server installed from an npm start script', function (done) {
      var args = [__dirname + '/../bin.js', 'start','start-script']
      if (process.env['SYSINIT']) args = args.concat(['--sysinit'], process.env['SYSINIT'])
      var child = spawn(process.argv[0], args, {stdio:'pipe'}).on('error', done);
      child.stdout.pipe(process.stderr);
      child.stderr.pipe(process.stderr);
      child.on('close', function (code) {
        code.should.eql(0)
        setTimeout(done, 2000);
      })
    })
  }

  it('should list the service installed from a service file', function (done) {
    var args = [__dirname + '/../bin.js', 'list', 'fake-pkg'];
    if (process.env['SYSINIT']) args = args.concat(['--sysinit'], process.env['SYSINIT'])
    var child = spawn(process.argv[0], args, {stdio:'pipe'}).on('error', done);
    var stdout = '';
    child.stdout.on('data', function (d) {
      stdout += d.toString();
    })
    child.stdout.pipe(process.stderr);
    child.stderr.pipe(process.stderr);
    child.on('close', function (code) {
      code.should.eql(0)
      stdout.should.match(/fake-pkg/)
      done();
    })
  })

  it('should connect to the server installed from a service file', function (done) {
    setTimeout(function () {
      var client = net.createConnection({port: 8090}, () => {
        client.end();
        done();
      });
      client.on('error', done);
    }, 10000)
  })




  it('should list the service installed from an npm start script', function (done) {
    var args = [__dirname + '/../bin.js', 'list', 'start-script'];
    if (process.env['SYSINIT']) args = args.concat(['--sysinit'], process.env['SYSINIT'])
    var child = spawn(process.argv[0], args, {stdio:'pipe'}).on('error', done);
    var stdout = '';
    child.stdout.on('data', function (d) {
      stdout += d.toString();
    })
    child.stdout.pipe(process.stderr);
    child.stderr.pipe(process.stderr);
    child.on('close', function (code) {
      code.should.eql(0)
      stdout.should.match(/start-script/)
      done();
    })
  })

  it('should connect to the server installed from an npm start script', function (done) {
    setTimeout(function () {
      var client = net.createConnection({port: 8091}, () => {
        client.end();
        done();
      });
      client.on('error', done);
    }, 10000)
  })


})
