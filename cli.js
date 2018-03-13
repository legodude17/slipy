#! /usr/bin/env node

const argv = require('minimist')(process.argv.slice(2));
const slipy = require('.');
const alias = require('./src/alias'); // eslint-disable-line no-unused-vars

/* eslint-disable no-console */

const command = argv._[0];

if (command === 'help' || argv.h || argv.help) {
  slipy.help();
} else {
  slipy.cli(argv).catch(err => (err.message.startsWith('Unrecognized command') ? false : console.error(err)));
}
