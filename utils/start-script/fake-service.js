#!/usr/bin/env node

var port = process.argv[2] || 8080;

var net = require('net');

var server = net.createServer((socket) => {
  socket.end('goodbye\n');
}).on('error', (err) => {
  throw err;
});

server.listen(port, () => {
  address = server.address();
  console.log('opened server on %j', address);
});

console.log("cwd=%j", process.cwd())
console.log("args=%j", process.argv)
console.log("env=%j", process.env)

process.getuid && console.log("uid=%j", process.getuid())
process.getgid && console.log("gid=%j", process.getgid())
