const fs = require("fs");
const prompt = require("inquirer").prompt;

exports.help = () => console.log(fs.readFileSync("docs.txt", "utf-8"));

exports.cli = function (argv) {
  switch (argv._.shift()) {
    case 'new':
      exports.new(argv._, argv);
      break;
    case 'run':
      exports.run(argv._, argv);
      break;
    case 'build':
      exxports.build(argv._, argv);
      break;
    case 'watch':
      exports.watch(argv._, argv);
      break;
    default:
      exports.help();
      break;
  }
};

Object.assign(exports, {
  ['new'](args, options) {
    prompt(require("./new/questions")).then(require("./new"));
  },
  run(args, options) {

  },
  build(args, options) {

  },
  watch(args, options) {

  },
  install(args, options) {

  }
});
