const building = require('./building');

module.exports = function build(m, opts) {
  const mode = m || opts.defaultEnv;
  building.init(opts.jobs);
  return building.transform(opts.graph)
    .then(newGraph => building.consolidate(newGraph))
    .then((mode === 'prod' || mode === 'production') ? (newGraph => building.minify(newGraph)) : (_ => _))
    .then(newGraph => building.write(newGraph, opts.outDir));
};
