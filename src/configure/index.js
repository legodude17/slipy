const getUserInput = require('./input');
const { analyseFiles } = require('./analyse');
const findEntry = require('./entry');
const { dg: depgraph } = require('../deps');
const { npm } = require('../install');

/* eslint-disable no-console */

function log(str, arg) {
  return function doLog(a) {
    console.log(str, arg ? a : '');
    return a;
  };
}

module.exports = function configure(dir) {
  if (dir) process.chdir(dir);
  console.log('Beginning construction of depgraph');
  console.log('Finding entry...');
  return findEntry(log)
    .then(log('Found entrypoint:', true))
    .then(log('Creating dep graph'))
    .then(entry => depgraph.createGraph(entry))
    .then(log('Resolving dependencies'))
    .then(graph => depgraph.resolve(graph))
    .then(log('Graph resolved.'))
    .then(log('Analysing files'))
    .then(graph => Promise.all([
      analyseFiles(Object.keys(graph.files).map(i => graph.files[i].file.path)),
      Promise.resolve(graph)
    ]))
    .then(log('Files analysed'))
    .then(([ana, graph]) => depgraph.analyse(graph, ana))
    .then(getUserInput)
    .then(log('Input:', true))
    .then(input => Promise.all(Object.keys(input).filter(i => i.startsWith('install') && input[i]).map(p => { log(`Installing ${p}`)(); return npm(p.replace('install-', '')); })));
};
