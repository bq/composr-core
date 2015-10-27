'use strict';

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
  promise = promise || Promise.resolve();

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
        promise.reject('error:get:items');
      }
    });
  });
};

/* Extracts a domain from an acces token */
function extractDomain(accessToken) {
  return corbel.jwt.decode(accessToken.replace('Bearer ', '')).domainId;
}

/* Accumulates results over an array */
function errorAccumulator(list) {
  return function(cb, data, err) {
    var ok = cb(data);
    if (!ok) {
      list.push(err);
    }
    return ok;
  };
}

function encodeToBase64(string) {
  return new Buffer(string).toString('base64');
}

function decodeFromBase64(string) {
  return new Buffer(string, 'base64').toString('utf8');
}

module.exports = {
  getAllRecursively: getAllRecursively,
  extractDomain: extractDomain,
  errorAccumulator: errorAccumulator,
  encodeToBase64: encodeToBase64,
  decodeFromBase64: decodeFromBase64,
  values: require('./validators/validate.utils')
};