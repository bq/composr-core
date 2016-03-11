'use strict';

var BaseStore = require('./BaseStore');

var VirtualDomainStore = function() {};

VirtualDomainStore.prototype = new BaseStore();

var singletonVirtualDomainStore = new VirtualDomainStore();

module.exports = singletonVirtualDomainStore;