const server = require('./server');
const watcher = require('./watcher');
const building = require('./building');
const { dp: deps } = require('./deps');

/* eslint-disable no-console */

module.exports = function watch(port, opts) {
  const { buildDir } = opts;
  const s = server.create(port, opts.serveUrl);
  const w = watcher.create();
  let { graph } = opts;
  building.init(opts.jobs);

  watcher.change(w, file => deps.updateFile(graph, file)
    .then(([newFiles, newGraph]) => { w.add(newFiles); graph = newGraph; return newGraph; })
    .then(g => building.transform(g))
    .then(g => building.consolidate(g))
    .then(g => server.addReload(g, s))
    .then(newGraph => building.write(newGraph, buildDir))
    .then(() => server.reload(s)));

  watcher.removal(w, file => console.log(deps.isFileNecessary(graph, file)));

  server.pointTo(s, buildDir);
  watcher.add(w, Object.keys(graph.files));

  return watcher.start(w).then(() => server.start(s));
};
