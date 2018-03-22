const jobs = require('./jobs');

const cache = {};

function error(error, job) {
  console.error('ERROR in worker:', error);
  process.send(JSON.stringify({ error, job }));
}

function success(result, job, type) {
  process.send(JSON.stringify({ job, result, type }));
}

process.on('message', (m) => {
  let message;
  try {
    message = JSON.parse(m);
    const jobber = jobs[message.type];
    const job = jobber.deserialize(message.job);
    jobber.cache(cache, job);
    jobber.work(job).then(result => {
      success(result, message.job, message.type);
    }).catch(err => error(err, message.job));
  } catch (err) {
    error(err, message.job);
  }
});

process.send('ready');
