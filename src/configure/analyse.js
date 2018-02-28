const fs = require('../util/fs');
const path = require('path');
const plugs = require('../plugins/plugins');

const analyse = module.exports = {
  analyseFiles(files) {
    return Promise.all(files.map(analyse.file))
      .then(as => {
        const o = {};
        as.forEach(v => { o[v.path] = v; });
        return o;
      });
  },
  file(f) {
    const plug = plugs.extensions[path.extname(f).slice(1)] || plugs.raw;
    return fs.readFile(f, 'utf-8')
      .then(code => Promise.all([plug.getInstall(code), plug.getJob(code)]))
      .then(res => ({
        install: res[0],
        work: res[1],
        path: f
      }));
  }
};
