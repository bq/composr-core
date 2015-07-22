'use strict';

function bindConfiguration(){
  //TODO: read from .composrrc from project root

  var config = {
    timeout : 10000
  };

  return config;
}

module.exports = bindConfiguration;