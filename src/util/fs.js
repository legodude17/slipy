const mkdirp = require('make-dir');
const del = require('del');
const fs = require('pify')(require('fs'));
const { access } = require('fs');


fs.exists = function exists(f) {
  return new Promise((res, rej) => access(f, err => {
    if (err) {
      if (err.code === 'ENOENT') res(false);
      else rej(err);
    } else res(true);
  }));
};

fs.rmrf = del;
fs.mkdirp = mkdirp;

module.exports = fs;
