const workers = require('./workers');
const cess = require('./process');
const p = require('../util/plugins');
const promise = require('../util/promises');
const path = require('path');

const building = module.exports = {
  init(plugins, opts) {
    building.plugins = plugins;
    building.workerManager = workers.createManager(opts.workers);
    cess.init(building.workerManager);
    building.config = opts;
  },
  buildFile(file) {
    return promise.serial(cess.getFileTasks(p.getPluginsForExtension(path.extname(file.path))));
  },
  combineFiles(ext, files) {
    const plugs = p.getPluginsForExtension(ext);
    if (typeof plugs.combine !== 'function') return Promise.reject(new Error('Can only use 1 combiner per extension'));
    return plugs.combine(files);
  }
};
