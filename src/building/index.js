const mm = require('micromatch');
const o = require('../util/objects');
const workers = require('./workers');

const building = module.exports = {
  init(plugins, files, opts) {
    building.plugins = plugins;
    building.workerManager = workers.createManager(opts.workers);
    buidling.config = opts;
  }
};
