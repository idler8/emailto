const LockCache = {};
module.exports = function(name, before = 0, after = 0) {
  return async function(asyncFunction) {
    const lockTo = LockCache[name];
    if (lockTo) {
      const sec = ~~((lockTo - Date.now()) / 1000);
      if (sec > 0) throw '请稍后再试（' + sec + 's）';
    }
    LockCache[name] = Date.now() + before;
    const response = await asyncFunction((changeAfter) => after = changeAfter);
    LockCache[name] = Date.now() + after;
    return response;
  };
};