const fs = require('pify')(require('fs'));
const object = require('../util/objects');
const loadPlugins = require('./loadPlugins');
const configDefaults = require('./defaults');

function readPlugins(slipyPlug) {
  const plugins = {};
  object.forEach(slipyPlug, (i, v) => {
    object.defaults(plugins, i.split('-'));
    object.setArr(plugins, i.split('-'), v);
  });
  return plugins;
}

module.exports = {
  getPlugins(slipy) {
    return loadPlugins(readPlugins(slipy.plugins));
  },
  loadConfig() {
    return fs.readFile('package.json')
      .then(buf => JSON.parse(buf.toString()).slipy)
      .then(obj => object.mergeDeep(obj, configDefaults));
  }
};
