const file = require('./file');

const depgraph = module.exports = {
  plugins: {},
  createGraph(entrypath, plugins = depgraph.plugins) {
    depgraph.plugins = plugins;
    file.init(plugins);
    return {
      entry: file.createFromPath(entrypath),
      files: {}
    };
  },
  startResolve(graph) {
    return file.resolve(graph.entry)
      .then(file => file.deps.forEach(p => depgraph.addDep(graph, p)));
  },
  resolveAll(graph) {
    if (Object.keys(graph.files).filter(i => !!graph.files[i]).length) {
      return Promise.all(depgraph.getTasks(graph));
    }
    return Promise.resolve(true);
  },
  addDep(graph, path) {
    graph.files[path] = null;
  },
  cache(graph, file) {
    graph.files[file.file.path] = file;
  },
  getTasks(graph) {
    return Object.keys(graph.files)
      .map(i => file.resolve(file.createFromPath(i)).then(f => depgraph.cache(graph, f)));
  },
  resolve(graph) {
    const maybeResolve = arg => arg === true && depgraph.resolveAll(graph).then(maybeResolve);
    return depgraph.resolve(graph).then(maybeResolve);
  }
};
