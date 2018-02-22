const objects = module.exports = {
  defaults(obj, keys, value = {}) {
    let o = obj;
    for (const v of keys.slice(0, -1)) {
      o = objects.default(o, v, {});
    }
    objects.default(o, keys[keys.length - 1], value);
    return o;
  },
  merge(obj, srcObj, fn = (v1, v2) => v1 || v2) {
    return objects.map(obj, (i, v) => fn(v, srcObj[i], i));
  },
  mergeDeep(obj, srcObj, fn = (v1, v2) => v1 || v2) {
    return objects.map(obj, (idx, value) => {
      const maybeRes = fn(value, srcObj[idx], idx);
      if (typeof maybeRes !== 'object') return maybeRes;
      return objects.mergeDeep(maybeRes, srcObj[idx], fn);
    });
  },
  default(obj, key, value = {}) {
    if (obj[key] == null) {
      obj[key] = value;
      return obj[key];
    }
    return obj[key];
  },
  forEach(obj, fn) {
    Object.keys(obj).forEach(v => fn(v, obj[v], obj));
  },
  setArr(obj, arr, value) {
    let o = obj;
    arr.slice(0, -1).forEach(v => { o = o[v]; });
    o[arr[arr.length - 1]] = value;
  },
  getArr(obj, arr) {
    let o = obj;
    arr.forEach(v => { o = o[v]; });
    return o;
  },
  map(obj, fn) {
    Object.keys(obj).forEach(v => { obj[v] = fn(v, obj[v], obj); });
  },
  hasOnly(obj, keys) {
    return Object.keys(obj).filter(k => !keys.includes(k)).length === 0 &&
      keys.filter(k => Object.keys(obj).includes(k)).length === 0;
  },
  dedupe(arr) {
    if (!Array.isArray(arr)) throw new Error('Not an array');
    // TODO: Add dedupeObj
    const res = [];
    arr.forEach(v => res.includes(v) && res.push(v));
    return res;
  }
};
