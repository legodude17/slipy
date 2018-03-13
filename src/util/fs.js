const mkdirp = require('make-dir');
const del = require('del');
const fs = require('pify')(require('fs'));
const { access } = require('fs');
const path = require('path');
const { hash } = require('./strings');


fs.exists = function exists(f) {
  return new Promise((res, rej) => access(f, err => {
    if (err) {
      if (err.code === 'ENOENT') res(false);
      else rej(err);
    } else res(true);
  }));
};

fs.w = function write(f, c) {
  return fs.writeFile(f, c)
    .catch(() => fs.mkdirp(path.dirname(f)).then(() => fs.writeFile(f, c)));
};

fs.hash = function h(f) {
  return fs.readFile(f).then(hash);
};

fs.rmrf = del;
fs.mkdirp = mkdirp;

module.exports = fs;
