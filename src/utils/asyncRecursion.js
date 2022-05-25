module.exports = function(asyncFunction) {
  return function Rerun() {
    return asyncFunction().catch(e => console.log(e)).then(() => Rerun());
  };
};