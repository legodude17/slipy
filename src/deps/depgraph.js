const file = require('./file');
const path = require('path');
const o = require('../util/objects');

const depgraph = module.exports = {
  plugins: {},
  createGraph(entrypath, plugins = depgraph.plugins) {
    depgraph.plugins = plugins;
    file.init(plugins);
    const entry = file.createFromPath(entrypath);
    return {
      entry,
      files: { [entrypath]: entry }
    };
  },
  startResolve(graph) {
    return file.resolve(graph.entry)
      .then(file => file.deps.forEach(p => depgraph.addDep(graph, path.join(path.dirname(file.file.path), p))));
  },
  resolveAll(graph) {
    if (Object.keys(graph.files).filter(i => !graph.files[i]).length) {
      return Promise.all(depgraph.getTasks(graph))
        .then(fs =>
          fs.forEach(f =>
            f.deps.forEach(p => {
              depgraph.addDep(graph, path.join(path.dirname(f.file.path), p));
            })));
    }
    return Promise.resolve(true);
  },
  addDep(graph, path) {
    if (graph.files[path]) return;
    graph.files[path] = null;
  },
  cache(graph, file) {
    graph.files[file.file.path] = file;
    return file;
  },
  getTasks(graph) {
    return Object.keys(graph.files).filter(i => !graph.files[i])
      .map(i => file.resolve(file.createFromPath(i)).then(f => depgraph.cache(graph, f)));
  },
  resolve(graph) {
    const maybeResolve = arg => {
      if (arg !== true) return depgraph.resolveAll(graph).then(maybeResolve);
      return true;
    };
    return depgraph.startResolve(graph).then(() => depgraph.resolveAll(graph)).then(maybeResolve).then(() => graph);
  },
  serialize(graph) {
    return JSON.stringify(graph);
  },
  deserialize(graphStr) {
    return JSON.parse(graphStr);
  },
  update(graph, fileUpdate) {
    graph.files[fileUpdate.path] = null;
    return depgraph.resolveAll(graph);
  },
  analyse(graph, analysation) {
    o.forEach(analysation, (i, v) => { graph.files[i].processed = v; });
    return graph;
  }
};
