const execa = require('execa');
const edit = require('../util/edit');
const path = require('path');
const object = require('../util/objects');
const fs = require('../util/fs');

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
      obj.slipy.plugins[key] = packageName;
    }
    return obj;
  };
}

function installNpm(p) {
  return execa('npm', ['i', p]);
}

module.exports = function install(opts) {
  if (opts.name.startsWith('slipy://')) {
    require('./builtins/' + opts.name.replace('slipy://', '')).install(); // eslint-disable-line
  }
  const packageName = `slipy-${opts.name}`;
  return installNpm(packageName)
    .then(() => fs.readFile(getPackageJSONPath(packageName)))
    .then(str => JSON.parse(str))
    .then(json => (json.slipy_plugin ? Promise.resolve(json) : Promise.reject(new Error('Not a slipy plugin'))))
    .then(json => edit.json('package.json', editPackageJSON(json, packageName)));
};

module.exports.npm = installNpm;
