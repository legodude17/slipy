module.exports = {
  runAll(funcs) {
    return funcs.map(fn => fn());
  }
};
