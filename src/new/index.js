const fs = require('pify')(require('fs'));
const util = require('util');

module.exports = function(opts) {
  const d = done(opts);
  switch (opts.type) {
    case 'blank':
      return fs.mkdir(opts.name).then(d, err);
    case 'basic':
      return require("./basic.js")(opts).then(d, err);
    case 'json':
      return require('./json.js')(opts).then(d, err);
    case 'npm':
      return require('./npm.js')(opts).then(d, err);
    case 'git':
      return require('./git.js')(opts).then(d, err);
    default:
      throw new Error(opts.type);
  }
}

function done(opts) {
  return _ => console.log("Created new project in", opts.name, _);
}

function err(err) {
  console.error("ERROR:", util.inspect(err, {depth: 1000}));
}
