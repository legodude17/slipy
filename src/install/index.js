const execa = require('execa');
const edit = require('../util/edit');
const path = require('path');
const object = require('../util/objects');
const fs = require('pify')(require('fs'));

function getPackageJSONPath(packageName) {
  return path.join(process.cwd(), 'node_modules', packageName, 'package.json');
}

function editPackageJSON(json, packageName) {
  return function edit(obj) {
    object.default(obj, 'slipy');
    object.default(obj.slipy, 'plugins');
    const key = `${json.slipy_plugin.extensions}-${json.slipy_plugin.type}`;
    if (obj.slipy.plugins[key]) {
      obj.slipy.plugins[key] = Array.isArray(obj.slipy.plugins[key]) ? obj.slipy.plugins[key].concat(packageName) : [obj.slipy.plugins[key], packageName]; //eslint-disable-line
    } else {
      obj.slipy.plugins[key] = packageName; // eslint-disable-line no-param-reassign
    }
    return obj;
  };
}

module.exports = function install(opts) {
  const packageName = `slipy-${opts.name}`;
  return execa('npm', ['i', packageName])
    .then(() => fs.readFile(getPackageJSONPath(packageName)))
    .then(str => JSON.parse(str))
    .then(json => (json.slipy_plugin ? Promise.resolve(json) : Promise.reject(new Error('Not a slipy plugin'))))
    .then(json => edit.json('package.json', editPackageJSON(json, packageName)));
};
