const o = require('./objects');
const mm = require('micromatch');

const plugins = module.exports = {
  getPluginsForExtension(extension, ps) {
    return plugins.mergePlugins(ps, Object.keys(ps).filter(pk => mm.isMatch(extension, pk)));
  },
  mergePlugins(ps, pluginKeys) {
    const plugs = {};
    pluginKeys.forEach(pk => {
      o.forEach(ps[pk], (i, v) => {
        o.default(plugs, i, []);
        plugs[i].push(v);
      });
    });
    return plugs;
  }
};
