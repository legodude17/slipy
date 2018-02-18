const fs = require('pify')(require('fs'));
module.exports = function (path, fn) {
  return fs.readFile(path)
    .then(contents => fn(contents.toString()))
    .then(str => fs.writeFile(path, str));
};

module.exports.json = function (path, fn) {
  return module.exports(path, str => JSON.stringify(fn(JSON.parse(str)), ' ', 2));
}
