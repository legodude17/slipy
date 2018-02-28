const fs = require('../util/fs');

module.exports = function edit(path, fn) {
  return fs.readFile(path)
    .then(contents => fn(contents.toString()))
    .then(str => fs.writeFile(path, str));
};

module.exports.json = function editJson(path, fn) {
  return module.exports(path, str => JSON.stringify(fn(JSON.parse(str)), ' ', 2));
};
