const workers = require('./workers');
const { dg: deps } = require('../deps');
const plugs = require('../plugins/plugins');
const path = require('path');
const o = require('../util/objects');
const dFile = require('../deps/file');

let depth = 0;

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
    return deps.load(g).then(graph => building._consolidate(graph));
  },
  _consolidate(g) {
    depth++;
    const entryExt = path.extname(g.entry.file.path).slice(1);
    const newGraph = deps.createGraph(g.entry.file.path);
    newGraph.cache = g.cache;
    const codes = {};
    if (g.entry.deps.length === 0) {
      newGraph.entry.file.contents = g.entry.file.contents;
      depth--;
      return newGraph;
    }
    console.log('deps for:', g.entry.file.path, 'at depth', depth);
    g.entry.deps
      .map(dep => { console.log('dep:', dep); return dep; })
      .map(dep => g.files[dep])
      .map(dep => [building._consolidate(deps.getSubGraph(g, dep.file.path)), dep])
      .map(([graph, dep]) => [
        plugs[path.extname(dep.file.path).slice(1)].consolidate(
          building.generate(dep, graph),
          graph.entry.file.path
        ),
        dep])
      .forEach(([code, dep]) => {
        o.forEach(g.entry.assignMap, (i, v) => {
          if (v
            .replace(/^\.\//, '')
            .startsWith(path.relative(path.dirname(g.entry.file.path), dep.file.path))
          ) codes[i] = code;
        });
      });
    codes[g.entry.file.path] = plugs[entryExt].generate(g.entry.file.contents)[entryExt];
    newGraph.entry.file.contents = plugs[entryExt].consolidate(codes, g.entry.file.path);
    depth--;
    return newGraph;
  },
  generate(dep, g) {
    const entryExt = path.extname(dep.file.path).slice(1);
    console.log('generating for:', dep.file.path, 'at depth', depth);
    console.log('with files', Object.keys(g.files));
    const files = o.map(
      g.files,
      (fpath, file, _, ext = path.extname(fpath).slice(1)) => {
        console.log('ext:', ext, 'for', fpath, file.file.contents.length, 'at depth', depth);
        if (ext !== 'png' && file.file.contents.length > 200000) throw new Error('BLEH');
        return plugs[ext]
          .generate(file.file.contents, fpath)[entryExt];
      }
    );
    const codes = {};
    o.forEach(dep.assignMap, (i, v) => {
      if (v.startsWith(dep.file.path)) codes[i] = files[path.relative(path.dirname(dep.file.path), v.split('/')[0])];
    });
    codes[dep.file.path] = files[dep.file.path];
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
