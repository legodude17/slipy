const path = require('path');
const fs = require('pify')(require('fs'));
const o = require('../util/objects');
const p = require('../util/plugins');

let plugins;
module.exports = function getDeps(file) {
  const ext = path.extname(file);
  const plugs = p.getPluginsForExtension(ext, plugins);
  return fs.readFile(file)
    .then(contents => Promise.all(plugs.map(p => Promise.resolve(p(contents)))))
    .then(arr => arr.reduce((arr, a) => arr.concat(a), []))
    .then(o.dedupe);
};

module.exports.init = function init(p) {
  plugins = p;
};
