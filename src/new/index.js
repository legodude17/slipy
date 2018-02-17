const fs = require('pify')(require('fs'));
const util = require('util');

module.exports = function(opts) {
  const d = done(opts);
  switch (opts.type) {
    case 'blank':
      fs.mkdir(opts.name).then(d, err);
      break;
    case 'basic':
      require("./basic.js")(opts).then(d, err);
      break;
    case 'json':
      require('./json.js')(opts).then(d, err);
      break;
    case 'npm':
      require('./npm.js')(opts).then(d, err);
      break;
    case 'git':
      require('./git.js')(opts).then(d, err);
      break;
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
