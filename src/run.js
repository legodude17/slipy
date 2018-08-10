const server = require('./server');
const building = require('./building');
const { dp: deps } = require('./deps');

module.exports = function run(port, opts) {
  const s = server.create(port, opts.serveUrl);
  let { graph } = opts;
  building.init(opts.jobs);

  server.listen(s, req => deps.recalcGraph(graph)
    .then(g => { graph = g; return g; })
    .then(g => building.buildToString(g, req.localPath)));

  return server.start(s);
};
