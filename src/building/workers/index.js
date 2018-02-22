const cluster = require('cluster');
const path = require('path');
const jobs = require('./jobs');
const EventEmitter = require('events');

const workers = module.exports = {
  createManager(opts) {
    cluster.setupMaster({ exec: path.join(__dirname, 'worker.js') });
    return {
      workerNum: opts.workerNum,
      workers: Array.from({ length: opts.workerNum }).fill(null),
      jobQueue: [],
      currentJobs: [],
      doneJobs: [],
      erroredJobs: [],
      ready: false,
      events: new EventEmitter()
    };
  },
  initManager(man, iw) {
    man.workers = man.workers.map((_, i) => workers.createWorker(man, i)); // eslint-disable-line no-param-reassign
    if (iw) {
      man.workers.forEach(workers.initWorker);
    }
  },
  createWorker(man, idx) {
    return {
      currentJob: null,
      workerObj: null,
      ready: false,
      manager: man,
      index: idx,
      events: new EventEmitter()
    };
  },
  initWorker(worker) {
    worker.workerObj = cluster.fork(); // eslint-disable-line no-param-reassign
    worker.workerObj.on('message', workers.processMessage(worker));
  },
  processMessage(worker) {
    return function messageProcess(messageStr) {
      if (messageStr === 'ready') {
        worker.ready = true; // eslint-disable-line no-param-reassign
        worker.events.emit('onReady');
        if (worker.manager.workers.every(w => w.ready)) {
          worker.manager.ready = true; // eslint-disable-line no-param-reassign
          worker.manager.events.emit('ready');
        }
        return;
      }
      const message = JSON.parse(messageStr);
      const job = jobs[message.type].deserialize(message.job);
      worker.currentJob = null; // eslint-disable-line no-param-reassign
      if (message.error) {
        const { error } = message; // eslint-disable-line no-param-reassign
        worker.manager.erroredJobs.push(job);
        worker.manager.events.emit('error', error, job);
      } else {
        worker.events.emit('jobDone', message.result, job);
        worker.manager.doneJobs.push(job);
        worker.manager.events.emit('jobDone', message.result, job);
      }
      worker.manager.currentJobs.forEach((j, i) => j.id === job.id && worker.manager.currentJobs.splice(i, 1));
      workers.distributeJobs(worker.manager);
    };
  },
  addJob(man, job) {
    if (!job.id) {
      job.id = Date.now().toString() + Math.random(); // eslint-disable-line no-param-reassign
    }
    man.jobQueue.push(job);
    workers.distributeJobs(man);
  },
  distributeJobs(man) {
    while (man.currentJobs.length < man.workers.length) {
      workers.startNextJob(man);
    }
  },
  startNextJob(man) {
    workers.startJob(man.workers.filter(w => !w.currentJob)[0], man.jobQueue.shift());
  },
  startJob(worker, job) {
    worker.currentJob = job; // eslint-disable-line no-param-reassign
    worker.workerObj.send(JSON.stringify({ job: jobs[job.type].serialize(job), type: job.type }));
  },
  run(man, job) {
    if (!job.id) {
      job.id = Date.now().toString() + Math.random(); // eslint-disable-line no-param-reassign
    }
    return new Promise(((resolve, reject) => {
      function onJobDone(result, maybeJob) {
        if (maybeJob.id === job.id) {
          resolve(result);
          man.events.removeListener('jobDone', onJobDone);
          man.events.removeListener('error', onJobError); // eslint-disable-line no-use-before-define
        }
      }
      function onJobError(error, maybeJob) {
        if (maybeJob.id === job.id) {
          reject(error);
          man.events.removeListener('error', onJobError);
          man.events.removeListener('jobDone', onJobDone);
        }
      }
      man.events.on('jobDone', onJobDone);
      man.events.on('error', onJobError);
      workers.addJob(man, job);
    }));
  }
};