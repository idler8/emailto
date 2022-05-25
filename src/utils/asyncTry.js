module.exports = function(callback) {
  return async function(asyncFunction, ...args) {
    try {
      await asyncFunction();
      callback(undefined, ...args);
    } catch (e) {
      callback(e, ...args);
    }
  };
};