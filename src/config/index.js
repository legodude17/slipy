const fs = require('../util/fs');
const object = require('../util/objects');
const configDefaults = require('./defaults');

module.exports = {
  loadConfig() {
    return fs.readFile('package.json')
      .then(buf => JSON.parse(buf.toString()).slipy)
      .then(obj => object.mergeDeep(obj, configDefaults));
  },
  loadGraph() {
    return fs.readFile('.cache/depgraph.json')
      .catch(() => new Error('No graph'));
  }
};
