const fs = require('fs');
const { prompt } = require('inquirer');
const path = require('path');
const { load: loadConfig } = require('./config');
const { getLike } = require('./util/strings');
/* eslint-disable no-console */
/* eslint-disable global-require */
/* eslint-disable no-unused-vars */
/* eslint-disable import/no-dynamic-require */
function done() {
  console.log('Check! Yay!');
}

function err(err) {
  console.error('ERROR:', err);
}

function run(type, arg, options) {
  return loadConfig().then(conf => require(`./${type}`)(arg, Object.assign(conf, { options })));
}

const commands = Object.assign(Object.create(null), {
  new(args, options) {
    return prompt(require('./new/questions')).then(require('./new'));
  },
  run(args, options) {
    return run('run', args[0], options);
  },
  build(args, options) {
    return run('build', args[0], options);
  },
  watch(args, options) {
    return run('build', args[0], options);
  },
  install(args, options) {
    if (args[0]) {
      return require('./install')({ name: args[0] });
    }
    return prompt(require('./install/questions')).then(require('./install'));
  },
  configure(args, options) {
    return require('./configure')(args[0]);
  }
});

exports.help = () => console.log(fs.readFileSync(path.join(__dirname, '../docs.txt'), 'utf-8'));

exports.cli = function cli(argv) {
  const command = argv._.shift();
  if (commands[command]) {
    return commands[command](argv._, argv).then(done, err);
  }
  console.error(`Unrecognized command ${command}. Did you mean:
${getLike(command, Object.keys(commands)).join('\n')}`);
  return Promise.reject(new Error('Unrecognized command'));
  // return exports.help();
};

Object.assign(exports, commands);
