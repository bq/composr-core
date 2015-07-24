'use strict';

var _ = require('lodash');

function bindConfiguration(options){
  //TODO: read from .composrrc from project root

  var config = {
    timeout : 10000,
    credentials : {},
    urlBase : ''
  };



  return _.defaults(options, config);
}

module.exports = bindConfiguration;