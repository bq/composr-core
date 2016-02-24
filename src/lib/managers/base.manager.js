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
  - _addToStore


  The mandatory methods for the child classes to implement are:
  _compile
  _addToStore
  _unregister
 */
function BaseManager(options) {
  this.itemName = options.itemName;
  this.store = otions.store;
  this.validator = options.validator;
  this.model = options.model;
}

//Reset the stack
BaseManager.prototype.resetItems = function() {
  this.store.reset();
};

//Entry point for registering or unregistering items
BaseManager.prototype.register = function(domain, itemOrItems) {
  var module = this;
  var itemsPromisesGenerator = currifiedToArrayPromise(itemOrItems);

  return itemsPromisesGenerator(function(item) {
    return module._register(domain, item);
  }, 
  function(result, item) {
    return {
      registered: result.state === 'fulfilled',
      id: item.id,
      model: result.state === 'fulfilled' ? result.value : null,
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

        var added = module._addToStore(domain, modelInstance);
        module.events.emit('debug', module.itemName + ':registered', added, modelInstance.getId());

        if (added) {
          //Corbel-composr listens to this event for registering routes. And uses item.id;
          module.events.emit(module.itemName + ':registered', modelInstance);
          module.__postAdd(domain, modelInstance);
        }

        return modelInstance;
      } else {

        module.events.emit('warn', module.itemName + ':not:registered', item.id);
        throw new Error('not:registered');
      }

    })
    .catch(function(err) {
      console.dir(err);
      module.events.emit('warn', module.itemName + ':not:registered', module.itemName + ':not:valid', item.id, err);
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

BaseManager.prototype._extractVirtualDomainFromId = function(id) {
  return id.split('!')[1];
};

BaseManager.prototype._addToStore = function(domain, modelInstance) {
  if (!domain || !modelInstance) {
    return false;
  }

  if (!modelInstance.getId()) {
    return false;
  }

  this.store.add(domain, modelInstance);
  return true;
};

BaseManager.prototype.getById = function(id){
  var domain = this._extractDomainFromId(id);
  return this.store.get(domain, id);
};

/********************************
  Mandatory implementations
********************************/

BaseManager.prototype._compile = function(domain, item) {
  //Implement freely
  this.events.emit('warn', '_compile not implemented');
  return item;
};


//Removes item from memory
BaseManager.prototype._unregister = function(domain, id) {
  if (!domain) {
    this.events.emit('warn', this.itemName + ':unregister:missing:parameters', 'domain');
    return false;
  }

  if (!id) {
    this.events.emit('warn', this.itemName + ':unregister:missing:parameters', 'id');
    return false;
  }

  if (this.store.exists(domain, id)) {
    this.store.remove(domain, id);
    this.events.emit('debug', this.itemName + ':unregistered', domain);
    return true;
  } else {
    this.events.emit('warn', this.itemName + ':unregister:not:found', domain);
    return false;
  }
};


/***************************************************
 CRUD interface
****************************************************/
BaseManager.prototype.load = function(id){
  var module = this;

  if(id){
    var domain = this._extractDomainFromId(id);
    return this.dao.load(id)
    .then(function(item){
      var model = new this.model(item);
      return model;
      //TODO: call this.register()
      ////TODO emit event with the number of items loaded
    });
  }else{
    return this.dao.loadAll()
      .then(function(items){
        return items.map(function(item){
          return new module.model(item);
        });
        //TODO call this.registerWithoutDomain
        //TODO emit event with the number of items loaded
      });
  }
  
};

/**
 * Conditional save.
 * - Checks if the json has to be saved
 * - Checks if the json is valid
 * - If it has to ve saved, calls __save
 * - If not, resolves
 * - If it is invalid, rejects
 */
BaseManager.prototype.save = function(json){

  var shouldBeSaved = this.__shouldSave(json);

  var module = this;

  return new Promise(function(resolve, reject){
    var validationResult = this.validate(vdJson);

    if(validationResult.valid === true){

      if (shouldBeSaved) {
        module.__save(json)
        .then(resolve)
        .catch(reject);
      }else{
        resolve(json);
      }

    }else{
      reject(validationResult);
    }
  });
};

BaseManager.prototype.__shouldSave = function(json){
  return this.getById(json.id) && this.getById(json.id).getMD5() !== json.md5;
};

BaseManager.prototype.__save = function(json){
  //TODO: Trigger the save event
  return this.dao.save(json);
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

BaseManager.prototype.__postAdd = function() {
  this.events.emit('warn', '__postAdd not implemented');
};

module.exports = BaseManager;
