const basicFile = require('../building/file');
const getDeps = require('./getdeps.js');
const fs = require('../util/fs');

const files = module.exports = {
  plugins: {},
  init(plugins) {
    files.plugins = plugins;
    // getDeps.setPlugins(plugins);
  },
  create(deps = [], ...fileArgs) {
    if (typeof deps === 'object' && !Array.isArray(deps)) {
      return {
        file: basicFile.create(deps),
        deps: []
      };
    }
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
      file: basicFile.create({ path }),
      deps: []
    };
  },
  resolve(file) {
    return Promise.all([getDeps(file.file.path), fs.readFile(file.file.path)])
      .then(res => {
        [{ deps: file.deps, assigns: file.assignMap, install: file.process }, file.file.contents] = res;
        return file;
      });
  },
  serialize(file) {
    return {
      file: basicFile.create({ path: file.file.path }),
      deps: file.deps
    };
  },
  deserialize(file) {
    return {
      file: basicFile.create({ path: file.file.path }),
      deps: file.deps
    };
  }
};
