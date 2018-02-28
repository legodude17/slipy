const { prompt } = require('inquirer');
const o = require('../util/objects');

module.exports = function input(graph) {
  return prompt([{
    type: 'confirm',
    name: 'save',
    message: 'Can I save the dependency graph to disk? (It will significantly speed up builds)'
  }].concat(o.dedupe(Object.keys(graph.files)
    .map(i => graph.files[i].processed.install)
    .reduce((arr, v) => arr.concat(v), []))
    .map(pkg => ({
      type: 'confirm',
      name: `install-${pkg}`,
      message: `Can I install the package ${pkg} that I have detected you need?`
    }))));
};
