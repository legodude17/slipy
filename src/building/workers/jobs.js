const r = require('../../util/require');
const file = require('../file');
const vm = require('vm');

exports.runPlugin = {
  serialize(job) {
    const serialJob = { file: JSON.stringify(job.file), id: job.id };
    switch (job.work.type) {
      case 'module':
        serialJob.module = job.work.moduleName;
        break;
      case 'script':
        serialJob.script = job.work.code;
        break;
      default:
        throw new Error(job.work.type);
    }
    return serialJob;
  },
  deserialize(serialJob) {
    const job = { file: JSON.parse(serialJob.file), id: serialJob.id };
    if (serialJob.module) {
      job.work = ['require', job.module];
    } else if (serialJob.script) {
      job.work = [serialJob.script, script => file => {
        // Need dynamic require to make this work
        const context = vm.createContext({ file, require: v => require(v) }); // eslint-disable-line
        return script.runInContext(context);
      }];
    } else {
      throw new Error('WHAT!?');
    }
    return job;
  },
  cache(cache, job) {
    /* eslint-disable no-param-reassign */
    if (job.work[0] === 'require') {
      if (cache[job.work[1]]) {
        job.work[1] = cache[job.work[1]];
      } else {
        cache[job.work[1]] = job.work[1] = r(job.work[1]);
      }
    } else if (cache[job.work[0]]) {
      job.work[1] = cache[job.work[0]];
    } else {
      cache[job.work[0]] = job.work[1] = job.work[1](new vm.Script(job.work[0]));
    }
  },
  work(job) {
    return Promise.resolve(job.work[1](job.file)).then(mf => (file.is(mf) ? mf : file.create(mf)));
  },
};
