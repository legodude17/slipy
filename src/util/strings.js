const crypto = require('crypto');

module.exports = {
  getLike(str, strs) {
    let like = strs;
    let prevLike = [];
    let i = 1;
    const fn = s => s.indexOf(str.slice(0, i)) !== -1;
    while (like.length && i <= str.length) {
      prevLike = like;
      like = like.filter(fn);
      i++;
    }
    if (i >= str.length) return like;
    return prevLike;
  },
  hash(string) {
    const h = crypto.createHash('md5');
    h.update(string);
    return h.digest('hex');
  }
};
