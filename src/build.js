const building = require('./building');

function log(str, arg) {
  return function doLog(a) {
    console.log(str, arg ? a : '');
    return a;
  };
}

module.exports = function build(m, opts) {
  const mode = m || opts.defaultEnv;
  building.init(opts.jobs);
  return building.transform(opts.graph)
    .then(log('Transform', true))
    .then(newGraph => building.consolidate(newGraph))
    .then((mode === 'prod' || mode === 'production') ? (newGraph => building.minify(newGraph)) : (_ => _))
    .then(newGraph => building.write(newGraph, opts.outDir))
    .then(log('Done'))
    .then(() => process.exit());
};
