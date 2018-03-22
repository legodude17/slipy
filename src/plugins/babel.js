const o = require('../util/objects');

const babel = module.exports = {
  getPackages(parts) {
    return o.dedupe(parts.map(part => part.version).map(babel.getTransformForVersion).filter(a => a));
  },
  getTransformForVersion(version) {
    if (version === '2015' || version === '2016') {
      return '@babel/preset-env';
    }
    if (version === 'proposal') {
      return 'babel-preset-stage-0';
    }
    return null;
  },
  /* getConfiguration(parts, targets) {
    const versions = parts.map(part => part.version);
    return {
      pluginsConfig: {
        babel: {
          presets: [
            (versions.includes('2015') || versions.includes('2016'))
              ?
              ['@babel/preset-env', { targets: { browsers: targets } }] : null,
            versions.includes('proposal') ? 'stage-0' : null
          ].filter(a => a)
        }
      }
    };
  }, */
  isBabelNeeded(parts) {
    const versions = parts.map(part => part.version);
    return !(versions.includes('2015') || versions.includes('2016') || versions.includes('proposal'));
  }
};
