const got = require('got');
const fs = require('fs');
const path = require('path');
const URL = require('url');

module.exports = exports = function download(to, from) {
  const name = path.posix.basename(URL.parse(from).pathname);
  got.stream(from).pipe(fs.createWriteStream(path.join(to, name)));
};

exports.to = function to(to) {
  return function download(from) {
    return exports(to, from);
  };
};
