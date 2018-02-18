const execa = require('execa');
const edit = require('../util/edit');
const path = require('path');
const object = require('../util/objects');
const fs = require('pify')(require('fs'));

module.exports = function (opts) {
  const packageName = 'slipy-' + opts.name;
  return execa('npm', ['i', packageName])
    .then(() => fs.readFile(getPackageJSONPath(packageName)))
    .then(str => JSON.parse(str))
    .then(json => json.slipy_plugin ? Promise.resolve(json) : Promise.reject("Not a slipy plugin"))
    .then(json => edit.json('package.json', editPackageJSON(json, packageName)))
    .then(console.log, console.error);
};

function getPackageJSONPath(packageName) {
  return path.join(process.cwd(), 'node_modules', packageName, 'package.json');
}

function editPackageJSON(json, packageName) {
  return function edit(obj) {
    object.default(obj, 'slipy');
    const key = json.slipy_plugin.extensions + '-' + json.slipy_plugin.type;
    if (obj.slipy[key]) {
      obj.slipy[key] = Array.isArray(obj.slipy[key]) ? obj.slipy[key].concat(packageName) : [obj.slipy[key], packageName];
    } else {
      obj.slipy[key] = packageName;
    }
    return obj;
  };
}
