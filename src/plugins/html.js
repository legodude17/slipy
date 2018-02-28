// Refrences for html deps.
// From https://github.com/parcel-bundler/parcel/blob/master/src/assets/HTMLAsset.js

// A list of all attributes that may produce a dependency
// Based on https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes
exports.ATTRS = {
  src: [
    'script',
    'img',
    'audio',
    'video',
    'source',
    'track',
    'iframe',
    'embed'
  ],
  href: ['link', 'a'],
  poster: ['video'],
  'xlink:href': ['use']
};

// A list of metadata that should produce a dependency
// Based on:
// - http://schema.org/
// - http://ogp.me
// - https://developer.twitter.com/en/docs/tweets/optimize-with-cards/overview/markup
// - https://msdn.microsoft.com/en-us/library/dn255024.aspx
exports.META = {
  property: [
    'og:image',
    'og:image:url',
    'og:image:secure_url',
    'og:audio',
    'og:audio:secure_url',
    'og:video',
    'og:video:secure_url'
  ],
  name: [
    'twitter:image',
    'msapplication-square150x150logo',
    'msapplication-square310x310logo',
    'msapplication-square70x70logo',
    'msapplication-wide310x150logo',
    'msapplication-TileImage'
  ],
  itemprop: [
    'image',
    'logo',
    'screenshot',
    'thumbnailUrl',
    'contentUrl',
    'downloadUrl'
  ]
};

const fs = require('../util/fs');

function checkPackageJson() {
  return fs.readFile('package.json', 'utf-8')
    .then(res => (JSON.parse(res).posthtml ? 'package.json' : new Error('Not found')));
}

exports.getPlugConfig = function pc() {
  return Promise.all(['posthtml.js', 'posthtml.json'].map(fs.exists))
    .then(res => (res.filter(Boolean).length ? res[0] : checkPackageJson()));
};
