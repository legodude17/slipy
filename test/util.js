const { serial } = require('../src/util/promises');

const promisify = a => () =>
  new Promise(res =>
    setTimeout(() => {
      console.log(a); // eslint-disable-line no-console
      res(a);
    }, Math.random() * 100));

serial([1, 2, 3].map(promisify));

// Promise.all([1, 2, 3].map(promisify));

module.exports = promisify;
