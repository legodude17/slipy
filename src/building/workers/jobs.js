const r = require('../../util/require');
const file = require('../file');
const vm = require('vm');
const localRequire = require('../../util/require');
const util = require('util');

exports.runPlugin = {
  serialize(job) {
    const serialJob = { file: job.file, id: job.id };
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
    // console.log(serialJob);
    const job = { file: serialJob.file, id: serialJob.id };
    if (serialJob.module !== undefined || serialJob.type === 'module') {
      job.work = ['require', job.module];
    } else if (serialJob.script !== undefined || serialJob.type === 'script') {
      job.work = [serialJob.script || 'file', script => file => {
        const context = vm.createContext({ file, require: v => localRequire(v) });
        return script.runInContext(context);
      }];
    } else {
      throw new Error(`What is ${util.inspect(serialJob, { depth: null })}`);
    }
    return job;
  },
  cache(cache, job) {
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
  }
};
