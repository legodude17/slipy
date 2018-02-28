const get = require('../util/get');
const fs = require('../util/fs');
const execa = require('execa');
const { serial } = require('../util/promises');

module.exports = function json(opts) {
  return fs.mkdir(opts.name)
    .then(() => get.json(opts.place))
    .then(a => { process.chdir(opts.name); return a; })
    .then(a => serial(a.cmds.map(v => () => execa.shell(v))));
};
