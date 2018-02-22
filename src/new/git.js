const execa = require('execa');

function normalizeGit(str) {
  if (/^[^/]+\/[^/]+$/.test(str)) {
    return `https://github.com/${str}`;
  }
  return str;
}

module.exports = function git(opts) {
  return execa('git', ['clone', normalizeGit(opts.place), opts.name]);
};
