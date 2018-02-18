const fs = require("fs");
const prompt = require("inquirer").prompt;

function done() {
  console.log("Check! Yay!");
}

function err(err) {
  console.error("ERROR:", err);
}

exports.help = () => console.log(fs.readFileSync("docs.txt", "utf-8"));

exports.cli = function (argv) {
  const command = argv._.shift();
  if (exports[command]) {
    return exports[command](argv._, argv).then(done, err);
  } else {
    return exports.help();
  }
};

Object.assign(exports, {
  ['new'](args, options) {
    return prompt(require("./new/questions")).then(require("./new"));
  },
  run(args, options) {
    // TODO: Start server that live-compiles
  },
  build(args, options) {
    // TODO: Build to a dir, with optional server
  },
  watch(args, options) {
    // TODO: Build to a dir, recompile on change
  },
  install(args, options) {
    if (args[0]) {
      return require("./install")({name: args[0]});
    }
    return prompt(require("./install/questions")).then(require("./install"));
  }
});
