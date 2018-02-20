const path = require('path');
exports.runPlugin = {
  serialize(job) {
    const serialJob = {file: JSON.stringify(job.file), id: job.id};
    switch (job.work.type) {
      case 'module':
        serialJob.module = job.work.moduleName;
      case 'script':
        serialJob.script = job.work.code;
      default:
        throw new Error(job.work.type);
    }
    return serialJob;
  },
  deserialize(serialJob) {
    const job = {file: JSON.parse(serialJob.file), id: serialJob.id};
    if (serialJob.module) {
      job.work = ['require', job.module];
    } else if (serialJob.script) {
      job.work = [serialJob.script, (script, file) => file => {
        var context = vm.createContext({file, require: v => require(v)});
        return file.create(script.runInContext(context));
      }];
    } else {
      throw new Error("WHAT!?");
    }
    return job;
  },
  cache(cache, job) {
    if (job.work[0] === 'require') {
      if (cache[job.work[1]]) {
        job.work[1] = cache[job.work[1]];
      } else {
        cache[job.work[1]] = job.work[1] = require(job.work[1]);
      }
    } else {
      if (cache[job.work[0]]) {
        job.work[1] = cache[job.work[0]];
      } else {
        cache[job.work[0]] = job.work[1] = job.work[1](new vm.Script(job.work[0]), require(path.join(__dirname, '../file')));
      }
    }
  },
  work(job) {
    return job.work[1](job.file);
  }
}
