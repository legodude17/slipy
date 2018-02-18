const fs = require('pify')(require('fs'));
const object = require('../util/objects');
const loadPlugins = require('./load');

module.exports = function () {
  return fs.readFile('package.json')
    .then(buf => JSON.parse(buf.toString).slipy)
    .then(getPlugins)
    .then(loadPlugins);
}

function getPlugins(slipy) {
  const plugins = {};
  object.forEach(slipy, (i, v) => {
    object.defaults(plugins, i.split('-'));
    object.setArr(plugins, i.split('-'), v);
  });
  return plugins;
}
