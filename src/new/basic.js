const fs = require("pify")(require("fs"));
const path = require('path');
const execa = require('execa');

module.exports = function (opts) {
  return fs.mkdir(opts.name)
    .then(() => process.chdir(opts.name))
    .then(() => fs.readFile(path.join(__dirname, 'basic-package.json')))
    .then(a => fs.writeFile("package.json", a.toString().replace('{name}', opts.name)))
    .then(() => execa('npm', ['install']));
};
