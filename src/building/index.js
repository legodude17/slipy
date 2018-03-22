const workers = require('./workers');
const { dg: deps } = require('../deps');
// const dg = require('../util/deps');
const plugs = require('../plugins/plugins');
const path = require('path');
const o = require('../util/objects');
const dFile = require('../deps/file');

const building = module.exports = {
  init(jobs) {
    building.manager = workers.createManager(jobs);
    workers.initManager(building.manager, true);
  },
  transform(g) {
    const newGraph = deps.createGraph(g.entry.file.path);
    newGraph.cache = g.cache;
    return Promise.all(Object.keys(g.files)
      .map(i => g.files[i])
      .map(f => dFile.read(f))
      .map(fileP => fileP.then(file => workers.run(building.manager, {
        work: file.processed.work,
        file: file.file,
        type: 'runPlugin'
      }))))
      .then(files => files.forEach(file => {
        newGraph.files[file.path] = dFile.create(g.files[file.path].deps, file);
      }))
      .then(() => newGraph);
  },
  consolidate(g) {
    console.log('graph is', g);
    const entryExt = path.extname(g.entry.file.path).slice(1);
    const newGraph = deps.createGraph(g.entry.file.path);
    newGraph.cache = g.cache;
    const codes = {};
    console.log('entry', g.entry.file.path, 'has', g.files);
    console.log('deps are', g.entry.deps);
    if (g.entry.deps.length === 0) {
      console.log('no deps');
      newGraph.entry.file.contents = g.entry.file.contents;
      return newGraph;
    }
    const temp = g.entry.deps.map(dep => { console.log('found', dep); return g.files[dep]; });
    console.log('temp', temp, '.length', temp.length);
    console.log('running with', temp);
    temp.map(dep => [building.consolidate(deps.getSubGraph(g, dep.file.path)), dep])
      .map(([graph, dep]) => [plugs[graph.entry.file.path].consolidate(
        building.generate(dep, graph),
        graph.entry.file.path
      ), dep])
      .forEach(([code, dep]) => {
        o.forEach(g.entry.assignMap, (i, v) => {
          if (v.startsWith(dep.file.path)) codes[i] = code;
        });
      });
    codes[g.entry.file.path] = plugs[entryExt].generate(g.entry.file.contents)[entryExt];
    newGraph.entry.file.contents = plugs[entryExt].consolidate(codes, g.entry.file.path);
    return newGraph;
  },
  generate(dep, g) {
    const files = o.map(
      g.files,
      (path, file, ext = path.extname(file.file.path).slice(1)) => plugs[ext]
        .generate(plugs[ext].url ? path : file.file.contents)[ext]
    );
    const codes = {};
    o.forEach(dep.assignMap, (i, v) => {
      if (v.startsWith(dep.file.path)) codes[i] = files[path.relative(path.dirname(dep.file.path), v.split('/')[0])];
    });
    codes[dep.file.path] = files[dep.file.path];
    console.log(codes, files);
    return codes;
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
    const files = o.map(g.files, (i, v) => Object.assign({}, v, Object.assign(
      {},
      v.file,
      { path: path.join(dir, v.file.path) }
    )));
    return deps.write({ files });
  }
};
