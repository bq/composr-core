'use strict';

var driver = null;

module.exports = {
  setDriver : function(corbelDriver){
    driver = corbelDriver;
  },
  getDriver : function(){
    return driver;
  }
};