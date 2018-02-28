/* eslint-disable */
const css = require('css');
const valueParser = require('postcss-value-parser');

const code = `div {
  background-color: url('stuff.png');
}`;

css.parse(code).stylesheet.rules.forEach(rule => {
  if (rule.type === 'rule') {
    rule.declarations.forEach(dec => {
      if (dec.type === 'declaration') {
        console.log(valueParser(dec.value).nodes[0]);
      }
    });
  }
});
