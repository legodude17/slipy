const vm = require('vm');
const util = require('util');
const file = require('../building/file');

const object = require('../util/objects');
module.exports = function (plugins) {
  object.forEach(plugins, (i, v) => {
    object.forEach(v, (j, p) => {
      plugins[i][j] = loadPlugin(p);
    });
  });
  return plugins;
}

function loadPlugin(p) {
  if (Array.isArray(p)) return p.map(loadPlugin);
  try {
    return require(p);
  } catch (e) {
    try {
      var script = new vm.Script(p);
      return file => {
        var context = vm.createContext({file, require: v => require(v)});
        return file.create(script.runInContext(context));
      };
    } catch (e) {
      throw new Error("I don't understand: " + util.inspect(p));
    }
  }
}
