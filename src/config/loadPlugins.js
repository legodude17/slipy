const vm = require('vm');
const util = require('util');
const file = require('../building/file');
const object = require('../util/objects');
const r = require('../util/require');

function loadPlugin(p) {
  if (Array.isArray(p)) return p.map(loadPlugin);
  let func;
  try {
    func = r(p);
    func.type = 'module';
    func.moduleName = p;
  } catch (e) {
    try {
      const script = new vm.Script(p);
      func = f => {
        const context = vm.createContext({ file: f, require: v => require(v) }); //eslint-disable-line
        return file.create(script.runInContext(context));
      };
      func.type = 'script';
      func.code = p;
    } catch (e) {
      throw new Error(`I don't understand: ${util.inspect(p)}`);
    }
  }
  return func;
}

module.exports = function loadPlugins(plugins) {
  object.forEach(plugins, (i, v) => {
    object.forEach(v, (j, p) => {
      plugins[i][j] = loadPlugin(p);
    });
  });
  return plugins;
};
