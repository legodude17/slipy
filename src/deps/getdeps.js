const path = require('path');
const fs = require('../util/fs');
const o = require('../util/objects');
const plugs = require('../plugins/plugins');
const download = require('../util/download');

function getAssigns(deps) {
  const assigns = { [Symbol.for('globals')]: [] };
  deps.forEach(dep => {
    if (dep.names) {
      o.forEach(dep.names, (v, i) => {
        assigns[i] = `${dep.place}/${v}`;
      });
    } else {
      assigns[Symbol.for('globals')].push(dep.place);
    }
  });
  return assigns;
}

function getInstaller(deps) {
  const urls = deps.filter(dep => dep.url).map(dep => dep.place);
  return function install(opts) {
    if (opts.down) {
      return Promise.all(urls.map(download.to(opts.assetsDir)));
    }
    return Promise.resolve(false);
  };
}

function normalizeDep(dep, folder) {
  if (path.isAbsolute(dep)) return dep;
  return path.relative(process.cwd(), path.resolve(folder, dep));
}

module.exports = function getDeps(file) {
  const plug = plugs[path.extname(file).slice(1)];
  if (!plug) throw new Error(`Unrecognized file ${file}, ${path.extname(file).slice(1)}`);
  return fs.readFile(file, 'utf-8')
    .then(contents => plug.getDeps(contents))
    .then(deps => ({
      deps: deps.map(dep => normalizeDep(dep.place, path.dirname(file))),
      assigns: getAssigns(deps),
      install: getInstaller(deps)
    }));
};
