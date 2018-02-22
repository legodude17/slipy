const jobs = require('./jobs');

const cache = {};

process.on('message', function process(message) {
  try {
    const jobber = jobs[message.type];
    const job = jobber.deserialize(message.job);
    jobber.cache(cache, job);
    jobber.work(job).then(result => {
      process.send(JSON.stringify({ job: jobber.serialize(job), result, type: message.type }));
    });
  } catch (error) {
    process.send(JSON.stringify({ error, job: message.job }));
  }
});

process.send('ready');
