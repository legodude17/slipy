const o = require('../util/objects');

const actions = ['preprocess', 'compile', 'postprocess'];

const process = module.exports = {
  init(workerManager) {
    process.workerManager = workerManager;
  },
  getFileTasks(file, plugins) {
    const plugs = {};
    actions.forEach(a => {
      o.default(plugins, a, []);
      plugs[a] = Array.isArray(plugins[a]) ? plugins[a] : [plugins[a]];
    });
    return actions
      .map(a => plugins[a])
      .reduce((arr, a) => arr.concat(a), [])
      .map(p => process.makeRunner(process.makeJob(file, p)));
  },
  makeJob(file, plugin) {
    const job = { file, work: { type: plugin.type } };
    switch (plugin.type) {
    case 'module':
      job.work.moduleName = plugin.moduleName;
      break;
    case 'script':
      job.work.script = plugin.code;
      break;
    default:
      throw new Error(plugin.type);
    }
    return job;
  },
  makeRunner: job => () => process.workerManager.run(job)
};
