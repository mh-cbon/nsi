NODE_BIN_PATH=/home/vagrant/node/node-v6.1.0-linux-x64/bin

cd /vagrant/

SYSINIT=systemd DEBUG=@mh-cbon/nsi $NODE_BIN_PATH/node $NODE_BIN_PATH/mocha test/reboot.js
SYSINIT=systemd DEBUG=@mh-cbon/nsi $NODE_BIN_PATH/node $NODE_BIN_PATH/mocha test/sapi.js
SYSINIT=systemd DEBUG=@mh-cbon/nsi $NODE_BIN_PATH/node $NODE_BIN_PATH/mocha test/sapi-fails.js
SYSINIT=systemd DEBUG=@mh-cbon/nsi $NODE_BIN_PATH/node $NODE_BIN_PATH/mocha test/remove.js
SYSINIT=systemd DEBUG=@mh-cbon/nsi $NODE_BIN_PATH/node $NODE_BIN_PATH/mocha test/validate.js
