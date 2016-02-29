var _ = require('lodash');
var q = require('q');
/*
 Proxy that accepts one or multiple items
 returns a function that executes a promise for each item
 and an **optional** callback that will be triggered for each item

 returns : promise
 */
function currifiedToArrayPromise(itemOrItems) {
  if (!itemOrItems) {
    return function(){
      return Promise.reject();
    }
  }

  var isArray = Array.isArray(itemOrItems);

  if (isArray === false) {
    itemOrItems = [itemOrItems];
  }

  itemOrItems = _.cloneDeep(itemOrItems);

  return function(itemCb, cb){
    var promises = itemOrItems.map(function(item) {
      return cb(item);
    });

    q.allSettled(promises)
      .then(function(results) {

        if(cb){
          results = results.map(cb);
        }else{
          results = results.map(function(result){
            return result.value;
          });
        }

        if (isArray) {
          dfd.resolve(results);
        } else {
          dfd.resolve(results[0]);
        }
      });

    return dfd.promise;
  }

};

module.exports = currifiedToArrayPromise;