function defaultMerge(v1, v2) {
  if (Array.isArray(v1)) return v1.concat(v2);
  return v1 || v2;
}

const objects = module.exports = {
  defaults(obj, keys, value = {}) {
    let o = obj;
    for (const v of keys.slice(0, -1)) {
      o = objects.default(o, v, {});
    }
    objects.default(o, keys[keys.length - 1], value);
    return o;
  },
  merge(obj, srcObj, fn = defaultMerge) {
    return objects.map(obj, (i, v) => fn(v, srcObj[i], i));
  },
  mergeDeep(obj, srcObj, fn = defaultMerge) {
    return objects.map(obj, (idx, value) => {
      const maybeRes = fn(value, srcObj[idx], idx);
      if (typeof maybeRes !== 'object' || !maybeRes) return maybeRes;
      if (Array.isArray(maybeRes) && fn([1], [2]).length !== 1) return maybeRes;
      return objects.mergeDeep(maybeRes, srcObj[idx] || {}, fn);
    });
  },
  mergeNot(obj, srcObj, props, fn = defaultMerge) {
    return objects.mergeDeep(obj, srcObj, (a, b, i) => {
      if (props.includes(i)) return null;
      return fn(a, b, i);
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
    const o = {};
    Object.keys(obj).forEach(v => { o[v] = fn(v, obj[v], obj); });
    return o;
  },
  hasOnly(obj, keys) {
    return Object.keys(obj).filter(k => !keys.includes(k)).length === 0 &&
      keys.filter(k => Object.keys(obj).includes(k)).length === 0;
  },
  dedupe(arr) {
    if (!Array.isArray(arr)) throw new Error('Not an array');
    // TODO: Add dedupeObj
    const res = [];
    arr.forEach(v => res.includes(v) || res.push(v));
    return res;
  },
  diffArr(arr1, arr2) {
    return arr1.concat(arr2).filter(v => !(arr1.includes(v) && arr2.includes(v)));
  },
  mapDeep(obj, fn) {
    function doMap(obj) {
      const o = {};
      Object.keys(obj).forEach(v => {
        if (typeof obj[v] === 'object' && obj[v]) o[v] = doMap(obj[v]);
        o[v] = fn(v, obj[v], obj);
      });
      return o;
    }
    return doMap(obj);
  }
};
