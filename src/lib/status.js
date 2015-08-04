'use strict';

function status() {
  /*jshint validthis:true */

  return {
    loadedResources: this.data
  };
}

module.exports = status;