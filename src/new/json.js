const get = require("../util/get");
const fs = require("pify")(require("fs"));
const execa = require('execa');
const serial = require('../util/promiseutils').serial;

module.exports = function (opts) {
  return fs.mkdir(opts.name)
    .then(() => get.json(opts.place))
    .then(a => (process.chdir(opts.name), a))
    .then(a => serial(a.cmds.map(v => () => execa.shell(v))));
};
