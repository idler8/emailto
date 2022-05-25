const asyncTimeout = require('./asyncTimeout.js');
module.exports = function(defaultDelay) {
  let promise = Promise.resolve();
  return function(asyncFunction, delay = defaultDelay) {
    return promise = promise.then(() => Promise.all([
      asyncFunction(),
      asyncTimeout(delay),
    ])).catch(e => console.log(e) || asyncTimeout(delay));
  };
};