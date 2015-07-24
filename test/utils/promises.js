var q = require('q');


var resolvedPromise = function(){
  var args = Array.prototype.slice.call(arguments);

  return q.resolve(args);
};

module.exports = {
  resolvedPromise : resolvedPromise
};