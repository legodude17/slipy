const mm = require('micromatch');
const o = require('../util/objects');
const workers = require('./workers');

const building = module.exports = {
  init(plugins, files, opts) {
    building.plugins = plugins;
    building.workerManager = workers.createManager(opts.workers);
    buidling.config = opts;
  },
  getPlugins(extension) {
    return building.mergePlugins(Object.keys(building.plugins).filter(pk => mm.isMatch(extension, pk)));
  },
  mergePlugins(pluginKeys) {
    const plugs = {};
    pluginKeys.forEach(pk => {
      o.forEach(building.plugins[pk], (i, v) => {
        o.default(plugs, i, []);
        plugs[i].push(v);
      });
    });
    return plugs;
  }
};
