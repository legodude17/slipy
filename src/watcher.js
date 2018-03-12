const chokidar = require('chokidar');

const watcher = module.exports = {
  create() {
    const watch = chokidar.watch('.', { cwd: process.cwd(), disableGlobbing: true });
    const w = { watch };
    watch.on('raw', watcher.makeListener(w));
    return w;
  },
  add(w, files) {
    files.forEach(file => w.watch.add(file));
  },
  makeListener(w) {
    return (event, path) => {
      if (event.startsWith('add')) {
        (w.additions || (_ => _))(path);
      } else if (event.startsWith('unlink')) {
        (w.removals || (_ => _))(path);
      } else {
        (w.changes || (_ => _))(path);
      }
    };
  },
  change(w, func) {
    w.changes = func;
  },
  addition(w, func) {
    w.additions = func;
  },
  removal(w, func) {
    w.removals = func;
  }
};
