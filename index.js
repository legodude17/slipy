#! /usr/bin/env node

const argv = require('minimist')(process.argv.slice(2));
const command = argv._[0];
const slipy = require(".");
const alias = require("./src/alias");

if (command === "help" || argv.h || argv.help) {
  slipy.help();
} else {
  slipy.cli(argv);
}
