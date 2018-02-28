const fs = require('../util/fs');
const util = require('util');

function done(opts) {
  return _ => console.log('Created new project in', opts.name, _); // eslint-disable-line no-console
}

function err(err) {
  console.error('ERROR:', util.inspect(err, { depth: 1000 })); // eslint-disable-line no-console
}


module.exports = function make(opts) {
  const d = done(opts);
  switch (opts.type) {
  case 'blank':
    return fs.mkdir(opts.name).then(d, err);
  case 'basic':
    return require('./basic.js')(opts).then(d, err); // eslint-disable-line global-require
  case 'json':
    return require('./json.js')(opts).then(d, err); // eslint-disable-line global-require
  case 'npm':
    return require('./npm.js')(opts).then(d, err); // eslint-disable-line global-require
  case 'git':
    return require('./git.js')(opts).then(d, err); // eslint-disable-line global-require
  default:
    throw new Error(opts.type);
  }
};
