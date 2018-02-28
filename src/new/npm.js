const execa = require('execa');
const inquirer = require('inquirer');
const os = require('os');
const path = require('path');
const fs = require('../util/fs');

let packageName;
let dirName;
let npxPath;

function installWithNpx() {
  return fs.mkdir(dirName)
    .then(() => process.chdir(dirName))
    .then(() => execa(npxPath, [packageName]));
}

function installNpx() {
  return execa('npm', ['i', '-g', 'npx'])
    .then(installWithNpx);
}

function getExecPath(dir) {
  return path.join(dir, 'node_modules', '.bin', packageName);
}

function installWOnpx() {
  const dir = path.join(os.tmpdir(), `slipy-${Math.random()}`);
  return fs.mkdir(dir)
    .then(() => execa('npm', ['i', packageName], { cwd: dir }))
    .then(() => fs.mkdir(dirName))
    .then(() => process.chdir(dirName))
    .then(() => execa(getExecPath(dir)))
    .then(() => fs.rmrf(dir, { force: true }));
}

function askForNpx() {
  return inquirer.prompt([{
    type: 'confirm',
    name: 'npx',
    message: 'npx is not installed. Can I install npx for you? (It will make this process smoother)',
    default: true
  }])
    .then(res => (res.npx ? installNpx() : installWOnpx()));
}

module.exports = function npm(opts) {
  packageName = `slipy-scaffold-${opts.place}`;
  dirName = opts.name;
  return execa('npm', ['config', 'get', '-g', 'prefix'])
    .then(a => {
      npxPath = path.join(a.stdout, 'bin', 'npx');
      execa(npxPath);
    })
    .then(installWithNpx, a => (a.code === 'ENOENT' ? askForNpx() : installWithNpx()));
};
