const basicFile = require('../building/file');
const getDeps = require('./getdeps.js');
const fs = require('pify')(require('fs'));

const file = module.exports = {
  plugins: {},
  init(plugins) {
    file.plugins = plugins;
    getDeps.setPlugins(plugins);
  }
  create(deps = [], ...fileArgs) {
    if (typeof deps === 'object' && !Array.isArray(deps)) return {
      file: basicFile.create(deps),
      deps: []
    };
    return {
      file: basicFile.create(...fileArgs),
      deps
    };
  },
  make(contents, map, path = '//memory', deps = []) {
    return {
      file: basicFile.make(contents, map, path),
      deps
    };
  },
  createFromPath(path) {
    return {
      file: basicFile.create({path}),
      deps: []
    };
  },
  resolve(file) {
    return Promise.all([getDeps(file.file.path), fs.readFile(file.file.path)])
      .then(res => {
        file.file.contents = res[1];
        file.deps = res[0];
        return file;
      });
  }
};
