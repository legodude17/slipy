const Module = require("module");

module.exports = function (m) {
  return new Module(process.cwd()).require(m);
}
