module.exports = {
  create(arg1, arg2, arg3) {
    if (typeof arg1 === 'object') {
      if (Array.isArray(arg1)) {
        return this.make(...arg1);
      }
      return this.make(arg1.contents || arg1.code || arg1.src, arg1.map || arg1.sourceMap, arg1.path);
    }
    return this.make(arg1, arg2, arg3);
  },
  make(contents, map, path = '//memory') {
    return {contents, path, map};
  }
}
