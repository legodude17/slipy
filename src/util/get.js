const http = require('http');
const fs = require('pify')(require('fs'));

const get = module.exports = function get(place) {
  try {
    new URL(place);
    return get.http(place);
  } catch (e) {
    return get.file(place);
  }
};

get.file = function (place) {
  return fs.readFile(place)
    .then(a => [a.toString(), {headers:{['content-type']:'application/json'}}]);
};

get.http = function (place) {
  return new Promise(function (resolve, reject) {
    http.get('http://nodejs.org/dist/index.json', (res) => {
      const { statusCode } = res;
      if (statusCode !== 200) {
        res.resume();
        reject(new Error('Request Failed.\n' + `Status Code: ${statusCode}`));
      }
      res.setEncoding('utf8');
      let rawData = '';
      res.on('data', (chunk) => { rawData += chunk; });
      res.on('end', () => {
        try {
          resolve([rawData, res]);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', (e) => {
      reject(e);
    });
  });
};

get.json = function (place) {
  return get(place)
    .then(([data, res]) => new Promise((r, rej) => {
      if (res.headers['content-type'].includes('application/json')) {
        r(JSON.parse(data));
      } else {
        rej(new Error("Not JSON"));
      }
    }));
};
