const workers = require('./workers');
const { dg: deps } = require('../deps');
// const dg = require('../util/deps');
const plugs = require('../plugins/plugins');
const path = require('path');
const o = require('../util/objects');
const fs = require('../util/fs');

const building = module.exports = {
  init(jobs) {
    building.manager = workers.createManager(jobs);
    workers.initManger(building.manager, true);
  },
  transform(g) {
    const newGraph = deps.createGraph(g.entry.file.path);
    newGraph.cache = g.cache;
    return Promise.all(Object.keys(g.files)
      .map(i => g.files[i])
      .map(file => workers.run(building.manager, { work: file.processed.work, file: file.file }).then(() => file)))
      .then(files => files.forEach(file => { newGraph.files[file.file.path] = file; }))
      .then(() => newGraph);
  },
  consolidate(g) {
    const entryExt = path.extname(g.entry.file.path).slice(1);
    const newGraph = deps.createGraph(g.entry.file.path);
    newGraph.cache = g.cache;
    return plugs.extensions[entryExt].consolidate(g.entry.deps
      .map(dep => building.consolidate(deps.getSubGraph(g, dep)))
      .map(graph => plugs[graph.entry.file.path].consolidate(
        building.generate(graph),
        graph.entry.file.path
      )), g.entry.file.path)
      .then(code => { newGraph.entry.file.contents = code; })
      .then(() => newGraph);
  },
  generate(g) {
    return o.map(
      g.files,
      (path, file) => plugs[path.extname(file.file.path).slice(1)]
        .generate(plugs[path.extname(file.file.path).slice(1)].url ? path : file.file.contents)
    );
  },
  minify(g) {
    const newGraph = deps.createGraph(g.entry.file.path);
    newGraph.cache = g.cache;
    return Promise.all(Object.keys(g.files)
      .map(i => g.files[i])
      .map(file => workers.run(
        building.manager,
        { work: plugs[path.extname(file.file.path).slice(1)].getMinify(file.file.contents), file: file.file }
      )))
      .then(files => files.forEach(file => { newGraph.files[file.path] = { file, deps: g.files[file.path].deps }; }))
      .then(() => newGraph);
  },
  buildToString(g) {
    return building.consolidate(g)
      .then(graph => graph.entry.file.contents);
  },
  write(g, dir) {
    return Promise.all(Object.keys(g.files)
      .map(i => g.files[i])
      .map(file => fs.writeFile(path.join(dir, file.file.path), file.file.contents)));
  }
};
