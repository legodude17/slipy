const path = require('path');
const URL = require('url');

module.exports = {
  join(url1, url2) {
    const parsed1 = URL.parse(url1, false, true);
    const parsed2 = URL.parse(url2);
    parsed1.pathname = path.posix.join(parsed1.pathname, parsed2.pathname);
    parsed1.search = parsed2.search;
    parsed1.hash = parsed2.hash;
    return URL.format(parsed1);
  },
  is(url) {
    try {
      URL.parse(url);
      return true;
    } catch (e) { return false; }
  }
};
