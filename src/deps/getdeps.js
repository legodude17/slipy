const path = require('path');
const plugs = require('../util/plugins.js');
const promise = require('../util/promises.js');
const fs = require('pify')(require('fs'));
const o = require('../util/objects');

var plugins;
module.exports = function (file) {
  const ext = path.extname(file);
  const plugs = p.getPluginsForExtension(ext, plugins);
  return fs.readFile(file)
    .then(contents => Promise.all(ps.map(p => Promise.resolve(p(contents)))))
    .then(arr => arr.reduce((arr, a) => arr.concat(a), []))
    .then(o.dedupe);
}

module.exports.init = function (p) {
  plugins = p;
}
