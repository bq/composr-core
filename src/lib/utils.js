'use strict';

var q = require('q');
var corbel = require('corbel-js');

/**
 * Recursivelly fetch all the items for a list
 * @param  {Function} caller     function that returns a promise with fetched items
 * @param  {List} items      List of items
 * @param  {Integer} pageNumber
 * @param  {Integer} pageSize
 * @param  {promise} promise
 * @return {List}
 */
var getAllRecursively = function getAllRecursively(caller, pageNumber, pageSize, items, promise) {
  items = items || [];
  pageNumber = pageNumber || 0;
  pageSize = pageSize || 20;
  promise = promise || q.resolve();

  return promise.then(function() {

    return caller(pageNumber, pageSize).
    then(function(response) {
      if (response.data && response.status === 200) {
        items = items.concat(response.data);
        if (response.data.length < pageSize) {
          return items;
        } else {
          return getAllRecursively(caller, pageNumber + 1, pageSize, items, promise);
        }
      } else {
        promise.reject('error:get:books');
      }
    });
  });
};

/* Extracts a domain from an acces token */
function extractDomain(accessToken) {
  return corbel.jwt.decode(accessToken.replace('Bearer ', '')).domainId;
}

module.exports = {
  getAllRecursively : getAllRecursively,
  extractDomain : extractDomain
};