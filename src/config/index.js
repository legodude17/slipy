const fs = require('../util/fs');
const object = require('../util/objects');
const configDefaults = require('./defaults');
const { dg } = require('../deps');

const config = module.exports = {
  loadConfig() {
    return fs.readFile('package.json')
      .then(buf => JSON.parse(buf.toString()).slipy)
      .then(maybeObj => maybeObj || {})
      .then(obj => object.mergeDeep(obj, configDefaults));
  },
  loadGraph() {
    return fs.readFile('.cache/depgraph.json', 'utf-8')
      .then(str => dg.deserialize(str))
      .catch(() => new Error('No graph'));
  },
  load() {
    return Promise.all([config.loadConfig(), config.loadGraph()])
      .then(([conf, graph]) => Object.assign({}, conf, { graph }));
  }
};
