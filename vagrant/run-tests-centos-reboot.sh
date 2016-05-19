NODE_BIN_PATH=/home/vagrant/node/node-v6.1.0-linux-x64/bin

cd /vagrant/

DEBUG=@mh-cbon/nsi SYSINIT=chkconfig $NODE_BIN_PATH/node $NODE_BIN_PATH/mocha test/reboot.js
DEBUG=@mh-cbon/nsi SYSINIT=chkconfig $NODE_BIN_PATH/node $NODE_BIN_PATH/mocha test/sapi.js
DEBUG=@mh-cbon/nsi SYSINIT=chkconfig $NODE_BIN_PATH/node $NODE_BIN_PATH/mocha test/sapi-fails.js
DEBUG=@mh-cbon/nsi SYSINIT=chkconfig $NODE_BIN_PATH/node $NODE_BIN_PATH/mocha test/remove.js
DEBUG=@mh-cbon/nsi SYSINIT=chkconfig $NODE_BIN_PATH/node $NODE_BIN_PATH/mocha test/validate.js
