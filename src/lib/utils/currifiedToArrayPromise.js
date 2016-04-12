'use strict'

var _ = require('lodash')
var q = require('q')
/*
 Proxy that accepts one or multiple items
 returns a function that executes a promise for each item
 and an **optional** callback that will be triggered for each item

 returns : promise
 */
function currifiedToArrayPromise (itemOrItems) {
  if (!itemOrItems) {
    return function () {
      return Promise.reject()
    }
  }

  var isArray = Array.isArray(itemOrItems)

  var theItems = _.cloneDeep(itemOrItems)

  if (isArray === false) {
    theItems = [theItems]
  }

  return function (itemCb, cb) {
    var promises = theItems.map(function (item) {
      return itemCb(item)
    })

    return new Promise(function (resolve) {
      q.allSettled(promises)
        .then(function (results) {
          if (cb) {
            results = results.map(function (result, index) {
              return cb(result, theItems[index])
            })
          } else {
            results = results.map(function (result) {
              return result.value
            })
          }

          if (isArray) {
            resolve(results)
          } else {
            resolve(results[0])
          }
        })
    })
  }
}

module.exports = currifiedToArrayPromise
