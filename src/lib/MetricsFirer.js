'use strict';

var events = require('./events');

var MetricsFirer = function(domain){
  this.domain = domain;
};

MetricsFirer.prototype.emit = function(data){
  events.emitter.emit('metrics', { domain : this.domain, data : data });
};

module.exports = MetricsFirer;