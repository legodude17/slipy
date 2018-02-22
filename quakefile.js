/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable  */
const run = require('quake-run');
const git = require('quake-git');

const args = process.argv.slice(3);
console.log(args);
quake.add('add', [git('add .')]);

quake.add('version', ['add'], [run(`npm version ${args[0]}`)]);

quake.add('git', [git('commit', {message: args[1]})]);

quake.add('deploy', ['version', 'git'], [run('npm publish'), git('push origin master')]);
