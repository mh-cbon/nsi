require('should');
var net = require('net')
var spawn = require('child_process').spawn;



describe('service remove', function () {
  this.timeout(50000);

  it('should remove the server installed from a service file', function (done) {
    var args = [__dirname + '/../bin.js', 'remove','fake-pkg']
    if (process.env['SYSINIT']) args = args.concat(['--sysinit'], process.env['SYSINIT'])
    var child = spawn(process.argv[0], args, {stdio:'pipe'}).on('error', done);
    child.stdout.pipe(process.stderr);
    child.stderr.pipe(process.stderr);
    child.on('close', function (code) {
      code.should.eql(0)
      setTimeout(done, 2000);
    })
  })

  it('should remove the server installed from an npm start script', function (done) {
    var args = [__dirname + '/../bin.js', 'remove','start-script']
    if (process.env['SYSINIT']) args = args.concat(['--sysinit'], process.env['SYSINIT'])
    var child = spawn(process.argv[0], args, {stdio:'pipe'}).on('error', done);
    child.stdout.pipe(process.stderr);
    child.stderr.pipe(process.stderr);
    child.on('close', function (code) {
      code.should.eql(0)
      setTimeout(done, 2000);
    })
  })


  it('should not list the service installed from a service file', function (done) {
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
      stdout.should.not.match(/fake-pkg/)
      done();
    })
  })

  it('should not connect to the server installed from a service file', function (done) {
    setTimeout(function () {
      var client = net.createConnection({port: 8090}, () => {
        client.end();
        done('it has connected...');
      });
      client.on('error', function (voidErr) {
        done();
      });
    }, 10000)
  })




  it('should not list the service installed from an npm start script', function (done) {
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
      stdout.should.not.match(/start-script/)
      done();
    })
  })

  it('should not connect to the server installed from an npm start script', function (done) {
    setTimeout(function () {
      var client = net.createConnection({port: 8091}, () => {
        client.end();
        done('it has connected...');
      });
      client.on('error', function (voidErr) {
        done();
      });
    }, 10000)
  })




})
