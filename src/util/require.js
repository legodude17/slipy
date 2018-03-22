const Module = require('module');
const path = require('path');

module.exports = function r(m) {
  const modu = new Module(process.cwd());
  modu.load(path.join(process.cwd(), 'package.json'));
  return modu.require(m);
};
