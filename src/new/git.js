const execa = require('execa');
const fs = require('pify')(require('fs'));

module.exports = function (opts) {
  return execa('git', ['clone', normalizeGit(opts.place), opts.name]);
}

function normalizeGit(str) {
  if (/^[^\/]+\/[^\/]+$/.test(str)) {
    return `https://github.com/${str}`;
  }
  return str;
}
