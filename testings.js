const building = require('./src/building');
const { dg } = require('./src/deps');
const fs = require('fs');
// const util = require('util');
// const r = require('./src/util/require');
process.chdir('testProject');

building.init(8);

const graph = dg.deserialize(fs.readFileSync('.cache/depgraph.json', 'utf8'));

building.consolidate(graph).then(g => console.log('Done!', g), console.error.bind(console, 'ERROR:')).then(() => process.exit());

// console.log(dg.getSubGraph(graph, 'app/a.css'));

// console.log(r('posthtml'));

process.exit();
