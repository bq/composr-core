var q = require('q');


var resolvedPromise = function(arg){
  return q.resolve(arg);
};

function resolvedCurriedPromise(arg){
  
  return function(){
    return resolvedPromise(arg);
  }
}

module.exports = {
  resolvedPromise : resolvedPromise,
  resolvedCurriedPromise : resolvedCurriedPromise
};