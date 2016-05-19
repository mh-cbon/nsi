NODE_BIN_PATH=/Users/vagrant/node/node-v6.1.0-darwin-x64/bin

cd /Users/vagrant/wd/

DEBUG=@mh-cbon/nsi $NODE_BIN_PATH/node $NODE_BIN_PATH/mocha test/reboot.js
DEBUG=@mh-cbon/nsi $NODE_BIN_PATH/node $NODE_BIN_PATH/mocha test/sapi.js
DEBUG=@mh-cbon/nsi $NODE_BIN_PATH/node $NODE_BIN_PATH/mocha test/sapi-fails.js
DEBUG=@mh-cbon/nsi $NODE_BIN_PATH/node $NODE_BIN_PATH/mocha test/remove.js
DEBUG=@mh-cbon/nsi $NODE_BIN_PATH/node $NODE_BIN_PATH/mocha test/validate.js
