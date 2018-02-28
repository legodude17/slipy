const fs = require('../util/fs');
const path = require('path');

const entryNames = ['index', 'main', 'app'];
const codeDirNames = ['src', 'lib', 'app'];

function noExist(err) {
  if (err.code === 'ENOENT') return false;
  throw err;
}

function isFile(file) {
  return fs.stat(file).then(stat => stat.isFile()).catch(noExist);
}

function isValidEntry(file) {
  return path.extname(file) === '.html' && entryNames.includes(path.basename(file, '.html'));
}

function isEntry(file) {
  return isFile(file).then(f => f && isValidEntry(file));
}

function isDir(file) {
  return fs.stat(file).then(stat => stat.isDirectory()).catch(noExist);
}

function isCodeDir(file) {
  return isDir(file).then(d => d && codeDirNames.includes(path.basename(file)));
}

module.exports = function findEntry(log) {
  function check(file) {
    log('Checking:', true)(file);
    return isEntry(file).then(log(`${file} is valid: `, true));
  }
  function checkDir(dir) {
    log('Checking:', true)(dir);
    return isCodeDir(dir).then(log(`${dir} is valid: `, true));
  }
  function checkAll(dir) {
    const get = v => path.join('.', dir, `${v}.html`);
    return Promise.all(entryNames.map(get).map(check))
      .then(res => res.map((v, i) => [v, get(entryNames[i])]).filter(v => v[0]))
      .then(arg => (arg.length ? arg[0][1] : new Error('No entry found'))); // eslint-disable-line no-use-before-define
  }
  function checkDirs() {
    return Promise.all(codeDirNames.map(checkDir))
      .then(res => res.map((v, i) => [v, codeDirNames[i]]).filter(v => v[0]))
      .then(arg => {
        if (arg.length) return Promise.all(arg.map(v => v[1]).map(checkAll));
        return [new Error('No entry found')];
      })
      .then(args => args.filter(arg => typeof arg === 'string'))
      .then(arg => {
        if (arg.length) return arg[0];
        throw new Error('No entry found');
      });
  }
  return checkAll('.').then(arg => (typeof arg === 'string' ? arg : checkDirs()));
};
