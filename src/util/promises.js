exports.serial = funcs =>
  funcs.reduce((promise, func) => promise.then(result => func(result)
    .then(Array.prototype.concat.bind(result))), Promise.resolve([]));
