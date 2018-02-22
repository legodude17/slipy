const fs = require('pify')(require('fs'));
const object = require('../util/objects');
const loadPlugins = require('./loadPlugins');
const configDefaults = require('./defaults');

const config = module.exports = {
  getPlugins(slipy) {
    return loadPlugins(readPlugins(slipy.plugins));
  },
  loadConfig() {
    return fs.readFile('package.json')
      .then(buf => JSON.parse(buf.toString()).slipy)
      .then(obj => object.mergeDeep(obj, configDefaults));
  }
};

function readPlugins(slipy_plug) {
  const plugins = {};
  object.forEach(slipy, (i, v) => {
    object.defaults(plugins, i.split('-'));
    object.setArr(plugins, i.split('-'), v);
  });
  return plugins;
}
