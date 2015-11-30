'use strict';

function MockedNext(next) {
  var module = this;

  this.next = next;

  this.promise = new Promise(function(resolve) {
    module.resolve = function(data){
      if(module.next){
        return resolve(next(data));
      }

      return resolve(data);
    };
  });
}

module.exports = function(next) {
  return new MockedNext(next);
};