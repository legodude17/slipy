const depgraph = require('./depgraph');

module.exports = function getDepGraph(entrypath, plugins) {
  const graph = depgraph.createGraph(entrypath, plugins);
  return depgraph.resolve(graph)
    .then(() => graph);
};
