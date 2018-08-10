const o = require('../util/objects');
const babel = require('./babel');
const valueParser = require('postcss-value-parser');
const htmlparser = require('htmlparser2');
const html = require('./html');
const codeUtils = require('../util/code');

const dutils = htmlparser.DomUtils;


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

plugins = {
  init(c) {
    config = c;
  },
  raw: {
    getInstall: arr
  },
  extensions: {
    js: {
      getInstall(code) {
        const parts = codeUtils.js.parse(code);
        if (!babel.isBabelNeeded(parts)) {
          return [];
        }
        return ['babel-core', 'uglify-es'].concat(babel.getPackages(parts));
      },
      getDeps(code) {
        const parts = codeUtils.js.parse(code);
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
      getJob(code, plugs = plugins.extensions.js.getInstall(code).slice(2).map(v => `'${v}'`)) {
        if (!plugs.length) return { type: 'script', code: 'file;' };
        return {
          type: 'script',
          code: `require('babel-core').transform(file.contents, {plugins:[${plugs.join(', ')}]})`
        };
      },
      getMinify() {
        return {
          type: 'script',
          code: 'require("uglify-es").minify(file.contents).code'
        };
      },
      generate(code) {
        return {
          js: `(function (module, exports, require) {
            ${code}
          })`,
          html: `<script type="text/javascript">
            ${code}
          </script>`
        };
      },
      consolidate(codes, main) {
        return `;(function () {
          var modules = {
            ${Object.keys(codes).map(i => [i, codes[i]]).map(([i, v]) => `${i} : ${v}`).join(',\n')}
          }
          var exports;
          function require(i) {
            if (typeof modules[i] === 'string') {
              return resolve(i);
            }
            return modules[i];
          };
          function resolve(i) {
            exports = {};
            modules[i] = modules[i]({main: ${main}, exports:exports}, exports, require).exports;
            return modules[i]l
          }
          for (var i in modules) {
            if (typeof modules[i] === 'string') {
              resolve(i);
            }
          }
        });`;
      }
    },
    css: {
      getInstall() {
        return ['postcss', 'postcss-use', 'clean-css'];
      },
      getDeps(code) {
        const { stylesheet: { rules } } = codeUtils.css.parse(code);
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
          code: 'require(\'postcss\')([require(\'postcss-use\')('*')], {from: undefined}).process(file.contents).then(res => ({contents: res.css, map: res.map.toString()}))' // eslint-disable-line
        };
      },
      getMinify() {
        return {
          type: 'script',
          code: 'new (require("clean-css"))({inline: ["none"]}).minify(file.contents)'
        };
      },
      generate(code) {
        return {
          css: code,
          js: `(function () {return ${codeUtils.css.parse(code).stylesheet.rules}})`,
          html: `<style media="screen">
            ${code}
          </style>`
        };
      },
      consolidate(codes, main) {
        console.log('css consolidate:', codes[main].length, Object.keys(codes), Object.keys(codes).map(i => codes[i]).map(v => v.length).join(' '));
        const parsed = codeUtils.css.parse(codes[main]);
        o.forEach(codes, (i, v) => {
          if (i.includes('/')) {
            const [selectors, prop] = i.split('/');
            parsed.stylesheet.rules.forEach((rule, ri) => {
              if (rule.type === 'import') parsed.stylesheet.rules.splice(ri, 1);
              if (rule.type === 'rule' && rule.selectors.join(' ') === selectors) {
                rule.declarations.forEach((dec, di) => {
                  if (prop === dec.property) {
                    parsed.stylesheet.rules[ri].declarations[di].value = v;
                  }
                });
              }
            });
          }
        });
        return [codeUtils.css.generate(parsed)]
          .concat(Object.keys(codes).filter(v => v !== main).filter(v => !v.includes('/')).map(i => codes[i]))
          .join('\n');
      }
    },
    html: {
      getInstall() {
        return ['posthtml', 'posthtml-load-plugins', 'html-minifier'];
      },
      getDeps(code) {
        const deps = [];
        const counter = {};
        const parser = new htmlparser.Parser({
          onopentag(tag, atrs) {
            counter[tag] = (counter[tag] || 0) + 1;
            if (tag === 'meta') {
              o.forEach(atrs, (i, v) => {
                if (html.META[i] && html.META[i].includes(v)) {
                  deps.push({ place: atrs.content, url: true, names: { '*': `meta/${counter.meta}/${i}` } });
                }
              });
              return;
            }
            if (tag === 'img') {
              if (atrs.srcset) {
                atrs.srcset.split(',').forEach((url, i) => {
                  deps.push({ place: url, url: true, names: { '*': `img/${counter.img}/srcset/${i}` } });
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
                  deps.push({ place: url, url: true, names: { '*': `${t}/${counter[tag]}` } });
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
            code: res ?  `require('posthtml')(require('posthtml-load-plugins')(${res})).process(file.contents).then(res => ({contents: res.html, map: res.map}))` : 'file;' // eslint-disable-line
          }));
      },
      getMinify() {
        return {
          type: 'script',
          code: 'require("html-minifier").minify(file.contents)'
        };
      },
      generate(code) {
        return {
          html: code,
          js: `\`${code}\``,
          css: ''
        };
      },
      consolidate(codes, main) {
        const code = codes[main];
        const parsed = htmlparser.parseDOM(code);
        const counter = {};
        return dutils.getOuterHTML(html.walk(parsed, node => {
          if (node.type === 'tag') {
            counter[node.name] = (counter[node.name] || 0) + 1;
            o.forEach(codes, (i, v) => {
              if (i === main) return;
              const p = i.split('/');
              if (p[0] === node.name && p[1] === counter[node.name]) {
                if (node.name === 'meta') {
                  node.attribs[p[2]] = v;
                  return;
                }
                if (node.name === 'img' && p[2] === 'srcset') {
                  const arr = node.attribs.srcset.split(',');
                  arr[p[3]] = v;
                  node.attribs.srcet = arr.join(',');
                  return;
                }
                node = htmlparser.parseDOM(v);
              }
            });
          }
          return node;
        }));
      }
    },
    htm: is('html'),
    png: {
      getInstall: arr,
      getDeps: arr,
      getJob: () => ({ type: 'script', code: 'file;' }),
      getMinify: () => ({ type: 'script', code: 'file;' }),
      generate: (data, url) => ({
        html: url,
        css: `url(${url})`,
        js: `(function () {return ${url}})`,
        png: data
      }),
      consolidate: (codes, main) => codes[main]
    },
    jpg: is('png'),
    jpeg: is('jpg')
  }
};

module.exports = new Proxy(plugins, {
  get(obj, key) {
    if (plugins[key]) {
      return plugins[key];
    }
    return plugins.extensions[key];
  }
});
