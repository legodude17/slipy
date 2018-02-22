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
    return p.getPluginsForExtension(ext).combine(files);
  },
};
