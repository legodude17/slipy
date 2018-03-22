const file = require('./file');
// const path = require('path');
const o = require('../util/objects');
const { hash } = require('../util/strings');

const depgraph = module.exports = {
  plugins: {},
  createGraph(entrypath, plugins = depgraph.plugins) {
    depgraph.plugins = plugins;
    file.init(plugins);
    const entry = file.createFromPath(entrypath);
    return {
      version: 2,
      entry,
      cwd: process.cwd(),
      files: { [entrypath]: entry },
      cache: { [entrypath]: '' }
    };
  },
  startResolve(graph) {
    return file.resolve(graph.entry)
      .then(file => {
        depgraph.cache(graph, file);
        graph.entry = graph.files[file.file.path];
        return file.deps.forEach(p => depgraph.addDep(graph, p));
      });
  },
  resolveAll(graph) {
    if (Object.keys(graph.files).filter(i => !graph.files[i]).length) {
      return Promise.all(depgraph.getTasks(graph))
        .then(fs =>
          fs.reduce((arr, f) =>
            arr.concat(f.deps.map(p => depgraph.addDep(graph, p))), []));
    }
    return Promise.resolve(true);
  },
  addDep(graph, path) {
    if (graph.files[path]) return path;
    graph.files[path] = null;
    return path;
  },
  cache(graph, file) {
    graph.files[file.file.path] = file;
    graph.cache[file.file.path] = hash(file.file.contents);
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
    return JSON.stringify({
      entry: file.serialize(graph.entry),
      files: o.map(graph.files, (i, v) => file.serialize(v)),
      cache: graph.cache
    }, null, 2);
  },
  deserialize(graphStr) {
    return o.map(JSON.parse(graphStr), (i, v) => {
      if (i === 'cache') return v;
      if (i === 'entry') return file.deserialize(v);
      return o.map(v, (j, b) => file.deserialize(b));
    });
  },
  update(graph, fileUpdate) {
    graph.files[fileUpdate.path] = null;
    return depgraph.resolveAll(graph);
  },
  analyse(graph, analysation) {
    o.forEach(analysation, (i, v) => { graph.files[i].processed = v; });
    return graph;
  },
  getSubGraph(graph, fpath) {
    const f = graph.files[fpath];
    const subGraph = depgraph.createGraph(f.file.path);
    let filesToAdd = Object.keys(subGraph.files).filter(i => !subGraph.files[i]);
    subGraph.entry = f;
    f.deps.forEach(dep => { subGraph.files[dep] = graph.files[dep]; });
    while (filesToAdd.length) {
      filesToAdd.forEach(i => {
        subGraph.files[i] = graph.files[i];
        subGraph.files[i].deps.forEach(dep => { subGraph.files[dep] = graph.files[dep]; });
      });
      filesToAdd = Object.keys(subGraph.files).filter(i => !subGraph.files[i]);
    }
    return subGraph;
  },
  updateFile(graph, file) {
    graph.files[file] = null;
    let newFiles = [];
    depgraph.addDep(graph, file);
    return file.resolve(graph.files[file])
      .then(file => { depgraph.cache(graph, file); return file.deps; })
      .then(deps => {
        deps.forEach(d => depgraph.addDep(graph, d));
        const resolve = isDone => (isDone ? Promise.resolve(true) :
          depgraph.resolveAll(graph).then(ds => {
            if (ds === true) return true;
            newFiles = newFiles.concat(ds.filter(d => graph.files[d.file.path]));
            return false;
          }).then(resolve));
        return resolve(false);
      })
      .then(() => newFiles);
  },
  recalcGraph(graph) {
    const newGraph = depgraph.createGraph(graph.entry.file.path);
    newGraph.cache = Object.assign({}, graph.cache);
    return depgraph.getToUpdate(graph)
      .then(toUpdate => Object.keys(graph.files)
        .forEach(graph.files, i => {
          newGraph.files[i] = toUpdate.map(f => f.file.path).includes(i) ? null : graph.files[i];
        }))
      .then(() => depgraph.resolve(newGraph));
  },
  getToUpdate(graph) {
    return Promise.all(Object.keys(graph)
      .map(i => [graph.files[i], graph.cache[i]])
      .map(([f, h]) => file.verify(f, h)))
      .then(files => files.filter(a => !!a));
  },
  isFileNecessary(graph, file) {
    return Object.keys(graph.files).map(i => graph.files[i]).reduce((b, f) => (b || f.deps.includes(file)), false);
  },
  write(graph) {
    return Promise.all(Object.keys(graph.files).map(i => graph.files[i]).map(file.write));
  }
};
