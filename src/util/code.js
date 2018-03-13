const babylon = require('babylon');
const traverse = require('babel-traverse');
const generate = require('babel-generate');
const css = require('css');
const { hash } = require('./strings');

const cache = new Map();

function parse(code, parser) {
  const h = hash(code);
  if (cache.has(h)) {
    return cache.get(h);
  }
  const parsed = parser(code);
  cache.set(h, parsed);
  return parsed;
}

const options = {
  js: {
    babylon: {
      sourceType: 'module',
      plugins: [
        'jsx',
        'flow',
        'asyncFunctions',
        'classConstructorCall',
        'doExpressions',
        'trailingFunctionCommas',
        'objectRestSpread',
        'decorators',
        'classProperties',
        'exportExtensions',
        'exponentiationOperator',
        'asyncGenerators',
        'functionBind',
        'funcionSent'
      ]
    }
  }
};

module.exports = {
  js: {
    parse(code, ast) {
      const parsed = parse(code, code => babylon.parse(code, options.js.babylon));
      if (ast) return parsed;
      const paths = [];
      traverse(parsed, {
        enter(path) {
          paths.push(path);
        }
      });
      return paths;
    },
    generate(ast, code) {
      return generate(ast, {}, code);
    },
    traverse(ast, obj) {
      return traverse(ast, obj);
    }
  },
  css: {
    parse(code) {
      return parse(code, code => css.parse(code));
    },
    generate(ast) {
      return css.stringify(ast);
    },
    traverse(ast, obj) {
      ast.stylesheet.rules.forEach(rule => obj.rule(rule));
      return ast;
    }
  }
};
