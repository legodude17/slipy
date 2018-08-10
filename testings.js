const building = require('./src/building');
const { dg } = require('./src/deps');
const fs = require('fs');
const o = require('./src/util/objects');
// const util = require('util');
// const r = require('./src/util/require');
process.chdir('testProject');

building.init(8);

const graph = dg.deserialize(fs.readFileSync('.cache/depgraph.json', 'utf8'));

o.forEach(graph.files, (i, v) => { graph.files[i].file.contents = fs.readFileSync(v.file.path, 'utf8'); });

console.log(building._consolidate(graph));
/*
building.consolidate(graph)
  .then(
    g => console.log('Done!', g),
    console.error.bind(console, 'ERROR:')
  ).then(() => process.exit());
*/
// console.log(require('util').inspect(dg.getSubGraph(graph, 'app/styles.css'), { depth: null, colors: true }));

// console.log(r('posthtml'));
