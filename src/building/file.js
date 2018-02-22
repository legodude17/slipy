const fs = require('pify')(require('fs'));
const o = require('../util/objects.js');
const mdir = require('make-dir');
const path = require('path');

const file = module.exports = {
  create(arg1, arg2, arg3) {
    if (typeof arg1 === 'object') {
      if (Array.isArray(arg1)) {
        return file.make(...arg1);
      }
      return file.make(arg1.contents || arg1.code || arg1.src, arg1.map || arg1.sourceMap, arg1.path);
    }
    return file.make(arg1, arg2, arg3);
  },
  make(contents = '', map = '', path = '//memory') {
    return { contents, path, map };
  },
  load(file) {
    return fs.readFile(file.path)
      .then(v => (file.contents = v));
  },
  write(file) {
    return fs.writeFile(file.path, file.contents)
      .catch(() =>
        mdir(path.dirname(file.path))
          .then(() => fs.writeFile(file.path, file.contents)));
  },
  is(file) {
    return o.hasOnly(file, ['contents', 'path', 'map']);
  },
};
