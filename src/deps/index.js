const depgraph = require('./depgraph');

module.exports = function (entrypath, plugins) {
  const graph = depgraph.createGraph(entrypath, plugins);
  return depgraph.resolve(graph)
    .then(() => graph);
};
