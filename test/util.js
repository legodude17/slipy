const serial = require("../src/util/promiseutils").serial;

const promisify = a => () =>
  new Promise(res =>
    setTimeout(() =>
      {
        console.log(a);
        res(a);
      }, Math.random() * 100));

serial([1, 2, 3].map(promisify));

// Promise.all([1, 2, 3].map(promisify));

module.exports = promisify;
