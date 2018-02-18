module.exports = {
  defaults(obj, keys, value = {}) {
    var o = obj;
    for (v of keys) {
      o = this.default(o, v, value);
    }
    return o;
  },
  default(obj, key, value = {}) {
    if (obj[key] == null) {
      return obj[key] = value;
    }
    return obj[key];
  },
  forEach(obj, fn) {
    Object.keys(obj).forEach(v => fn(v, obj[v], obj));
  },
  setArr(obj, arr, value) {
    var o = obj;
    arr.slice(0, -1).forEach(v => o = o[v]);
    o[arr[arr.length - 1]] = value;
  },
  getArr(obj, arr, value) {
    var o = obj;
    arr.forEach(v => o = o[v]);
    return o;
  }
}
