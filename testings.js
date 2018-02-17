const execa = require('execa');
const path = require('path');
execa('npm', ['config', '-g', 'get', 'prefix'])
  .then(a => execa(path.join(a.stdout, 'bin', 'npx')))
  .then(console.log, console.error);
