'use strict';

var q = require('q');
var currifiedToArrayPromise = require('../utils/currifiedToArrayPromise');

/** 
  BaseManager: 
  Class that creates a flow of execution and some base methods
  This class provides the following interface:
  - register
    - _register
  - unregister
    - _unregister
  - compile
    - _compile
  - validate
  - _extractDomainFromId
  - _addToList


  The mandatory methods for the child classes to implement are:
  _compile
  _addToList
  _unregister
 */
function BaseManager(options) {
  this.itemName = options.itemName;
  this.item = options.item;
  this.validator = options.validator;
  this[options.item] = {};
}

//Reset the stack
BaseManager.prototype.resetItems = function() {
  this[this.item] = {};
};

//Entry point for registering or unregistering items
BaseManager.prototype.register = function(domain, itemOrItems) {
  var itemsPromisesGenerator = currifiedToArrayPromise(itemOrItems);

  return itemsPromisesGenerator(function(item) {
    return module._register(domain, item);
  }, 
  function(result, index) {
    return {
      registered: result.state === 'fulfilled',
      id: itemOrItems[index].id,
      compiled: result.state === 'fulfilled' ? result.value : null,
      error: result.reason ? result.reason : null
    };
  });
};

//Register an item on the stack
BaseManager.prototype._register = function(domain, item) {

  var module = this;

  return this.validate(item)
    .then(function() {

      module.__preCompile(domain, item);

      //Returns the MODEL
      var modelInstance = module.compile(domain, item);

      if (modelInstance) {
        module.__preAdd(domain, modelInstance);

        var added = module._addToList(domain, modelInstance);
        module.events.emit('debug', module.itemName + ':registered', added, modelInstance.getId());

        if (added) {
          //Corbel-composr listens to this event for registering routes. And uses item.id;
          module.events.emit(module.itemName + ':registered', modelInstance);
        }

        return modelInstance;
      } else {
        module.events.emit('warn', module.itemName + ':not:registered', item.getId());
        throw new Error('not:registered');
      }

    })
    .catch(function(err) {
      module.events.emit('warn', module.itemName + ':not:registered', module.itemName + ':not:valid', item.getId(), err);
      throw err;
    });
};

//Registers phrases, extracting domain from id (TODO: Test)
BaseManager.prototype.registerWithoutDomain = function(items) {
  var module = this;

  var promises = [];

  var itemsHash = {};

  items.forEach(function(item) {
    var domain = module._extractDomainFromId(item.id);

    if (!itemsHash[domain]) {
      itemsHash[domain] = [];
    }

    itemsHash[domain].push(item);
  });

  Object.keys(itemsHash).forEach(function(key) {
    promises.push(module.register(key, itemsHash[key]));
  });

  return q.all(promises);
};


//Verifies that a JSON for a item is well formed
BaseManager.prototype.validate = function(item) {
  return this.validator(item)
    .then(function() {
      return {
        valid: true
      };
    })
    .catch(function(errors) {
      throw ({
        valid: false,
        errors: errors
      });
    });
};

//Iterates over the items to compile
BaseManager.prototype.compile = function(domain, itemOrItems) {
  var module = this;

  var isArray = Array.isArray(itemOrItems);

  if (isArray === false) {
    itemOrItems = [itemOrItems];
  }

  var compiledResults = itemOrItems.map(function(item) {
    return module._compile(domain, item);
  });

  return isArray ? compiledResults : compiledResults[0];
};

//Iterates over the items to unregister
BaseManager.prototype.unregister = function(domain, itemOrItemIds) {
  var module = this;

  var isArray = Array.isArray(itemOrItemIds);

  if (isArray === false) {
    itemOrItemIds = [itemOrItemIds];
  }

  var results = itemOrItemIds.map(function(id) {
    module.events.emit('debug', module.itemName + ':unregister:' + id);
    return module._unregister(domain, id);
  });

  if (isArray === false) {
    return results[0];
  } else {
    return results;
  }

};

//Extracts the domain from a database item
BaseManager.prototype._extractDomainFromId = function(id) {
  return id.split('!')[0];
};

/********************************
  Mandatory implementations
********************************/

BaseManager.prototype._compile = function(domain, item) {
  //Implement freely
  this.events.emit('warn', '_compile not implemented');
  return item;
};

BaseManager.prototype._addToList = function() {
  //Implement freely
  this.events.emit('warn', '_addToList not implemented');
  return true;
};

//Removes item from memory
BaseManager.prototype._unregister = function() {
  //Implement freely
  this.events.emit('warn', '_unregister not implemented');
};

/********************************
  Optional methods
********************************/

//Pre compile call
BaseManager.prototype.__preCompile = function() {
  this.events.emit('warn', '__preCompile not implemented');
};

//Pre add call
BaseManager.prototype.__preAdd = function() {
  this.events.emit('warn', '__preAdd not implemented');
};

module.exports = BaseManager;
