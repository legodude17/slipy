const cluster = require('cluster');
const jobs = require('./jobs');
const cache = {};

process.on("message", function process(message) {
  try {
    const jobber = jobs[message.type];
    const job = jobber.deserialize(message.job);
    jobber.cache(cache, job);
    const result = jobber.work(job);
    process.send(JSON.stringify({job: jobber.serialize(job), result, type: message.type}));
  } catch (error) {
    process.send(JSON.stringify({error, job: message.job}));
  }
});

process.send("ready");
