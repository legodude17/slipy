const http = require('http');
const fs = require('pify')(require('fs'));
const URL = require('url');

const get = module.exports = function get(place) {
  try {
    const url = new URL(place);
    return get.http(URL.format(url));
  } catch (e) {
    return get.file(place);
  }
};

get.file = function getFile(place) {
  return fs.readFile(place)
    .then(a => [a.toString(), { headers: { 'content-type': 'application/json' } }]);
};

get.http = function getFromWeb(place) {
  return new Promise(((resolve, reject) => {
    http.get(place, (res) => {
      const { statusCode } = res;
      if (statusCode !== 200) {
        res.resume();
        reject(new Error(`Request Failed.\nStatus Code: ${statusCode}`));
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
  }));
};

get.json = function getJson(place) {
  return get(place)
    .then(([data, res]) => new Promise((r, rej) => {
      if (res.headers['content-type'].includes('application/json')) {
        r(JSON.parse(data));
      } else {
        rej(new Error('Not JSON'));
      }
    }));
};
