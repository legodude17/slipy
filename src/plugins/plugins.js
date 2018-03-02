const detectVersion = require('ecmascript-version-detector');
const o = require('../util/objects');
const babel = require('./babel');
const css = require('css');
const valueParser = require('postcss-value-parser');
const htmlparser = require('htmlparser2');
const html = require('./html');


let config; // eslint-disable-line no-unused-vars
let plugins;

function is(extension) {
  return new Proxy({}, {
    get(key) {
      return plugins.extensions[extension][key];
    }
  });
}

const arr = () => [];

plugins = module.exports = {
  init(c) {
    config = c;
  },
  raw: {
    getInstall: arr
  },
  extensions: {
    js: {
      getInstall(code) {
        const parts = detectVersion.parse(code);
        if (!babel.isBabelNeeded(parts)) {
          return [];
        }
        return ['babel-core'].concat(babel.getPlugins(parts));
      },
      getDeps(code) {
        const parts = detectVersion.parse(code);
        const deps = [];
        parts.forEach(part => {
          const { node } = part;
          if (
            node.type === 'VariableDeclarator' &&
            node.init.type === 'CallExpression' &&
            node.init.arguments.length === 1 &&
            node.init.callee.name === 'require' &&
            node.init.arguments[0].value
          ) {
            deps.push({ names: { '*': node.id.name }, place: node.init.arguments[0].value });
          }
          if (node.type === 'ImportDeclaration') {
            const dep = { place: node.source.value, names: {} };
            node.specifiers.forEach(spec => {
              dep.names[(spec.imported && spec.imported.name) || '*'] = spec.local.name;
            });
            deps.push(dep);
          }
        });
        return deps;
      },
      getJob(code, plugs = plugins.extensions.js.getInstall(code).map(v => `'${v}'`)) {
        if (!plugs.length) return { type: 'script', code: '' };
        return {
          type: 'script',
          code: `require('babel').transfrom(file.contents, {plugins:${plugs.join(', ')}})`
        };
      }
    },
    jsx: {
      getInstall(code) {
        const parts = detectVersion.parse(code);
        return ['babel-core', 'babel-plugin-transform-jsx-react'].concat(babel.getPlugins(parts));
      },
      getDeps(code) {
        return plugins.extensions.js.getDeps(code);
      },
      getJob(code) {
        return plugins.extensions.js.getJob(code, plugins.extensions.jsx.getInstall(code));
      }
    },
    css: {
      getInstall() {
        return ['postcss', 'postcss-use'];
      },
      getDeps(code) {
        const { stylesheet: { rules } } = css.parse(code);
        const deps = [];
        rules.forEach(rule => {
          if (rule.type === 'import') {
            const { nodes: [name, ...m] } = valueParser(rule.import);
            const media = m.map(node => (node.type !== 'space' ? node.value : null)).filter(Boolean);
            if (name.type === 'word') {
              return deps.push({ place: name.value, media });
            } else if (name.type === 'function' && name.value === 'url') {
              return deps.push({ place: name.nodes[0].value, media });
            }
            throw new Error('Don\'t understand this @import');
          } else if (rule.type === 'rule') {
            rule.declarations.forEach(dec => {
              if (dec.type === 'declaration') {
                const parsed = valueParser(dec.value);
                parsed.walk(node => {
                  if (node.type === 'function' && node.value === 'url') {
                    return deps.push({
                      place: node.nodes[0].value,
                      url: true,
                      names: { '*': `${rule.selectors.join(' ')}/${dec.property}` }
                    });
                  }
                  return null;
                });
              }
            });
          }
          return null;
        });
        return deps;
      },
      getJob() {
        return {
          type: 'script',
          code: 'require(\'postcss\')([require(\'postcss-use\')]).process(file.contents).then(res => {contents: res.css, map: res.map.toString()})' // eslint-disable-line
        };
      }
    },
    html: {
      getInstall() {
        return ['posthtml', 'posthtml-load-plugins'];
      },
      getDeps(code) {
        const deps = [];
        const parser = new htmlparser.Parser({
          onopentag(tag, atrs) {
            if (tag === 'meta') {
              o.forEach(atrs, (i, v) => {
                if (html.META[i] && html.META[i].includes(v)) {
                  deps.push({ place: atrs.content, url: true, names: { '*': `${tag}/${i}` } });
                }
              });
              return;
            }
            if (tag === 'img') {
              if (atrs.srcset) {
                atrs.srcset.split(',').forEach((url, i) => {
                  deps.push({ place: url, url: true, names: { '*': `${tag}/${i}` } });
                });
                return;
              }
            }
            o.forEach(html.ATTRS, (i, v) => {
              v.forEach(t => {
                if (t === tag) {
                  const url = atrs[i];
                  if (!url) return;
                  if (url.lastIndexOf('.') < 1) return;
                  deps.push({ place: url, url: true, names: { '*': t } });
                }
              });
            });
          }
        });
        parser.write(code);
        parser.end();
        return deps;
      },
      getJob() {
        return html.getPlugConfig()
          .then(res => ({
            type: 'script',
            code: `require('posthtml')(require('posthtml-load-plugins')(${res||"''"})).process(file.contents).then(res => {contents: res.html, map: res.map})` // eslint-disable-line
          }));
      }
    },
    htm: is('html'),
    png: {
      getInstall: arr,
      getDeps: arr,
      getJob: () => ({ type: 'script', code: '' })
    },
    jpg: is('png'),
    jpeg: is('jpg')
  }
};
