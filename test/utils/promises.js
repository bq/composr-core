var q = require('q');


var resolvedPromise = function(arg){
  return q.resolve(arg);
}

function resolvedCurriedPromise(arg){
  return function(){
    return resolvedPromise(arg);
  }
}

function rejectedPromise(arg){
  return q.reject(arg);
}

module.exports = {
  resolvedPromise : resolvedPromise,
  resolvedCurriedPromise : resolvedCurriedPromise,
  rejectedPromise : rejectedPromise
};