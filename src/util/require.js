const Module = require('module');

module.exports = function r(m) {
  return new Module(process.cwd()).require(m);
};
