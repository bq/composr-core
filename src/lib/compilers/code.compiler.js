'use strict';

var q = require('q');
var _ = require('lodash');
var vm = require('vm');

function CodeCompiler(options) {
  this.itemName = options.itemName;
  this.item = options.item;
  this.validator = options.validator;
  this[options.item] = {};
}

//Reset the stack
CodeCompiler.prototype.resetItems = function() {
  this[this.item] = {};
};

//Entry point for registering or unregistering items
CodeCompiler.prototype.register = function(domain, itemOrItems) {
  if (!itemOrItems || !domain) {
    return q.reject();
  }

  var dfd = q.defer();

  var module = this;

  var isArray = Array.isArray(itemOrItems);

  if (isArray === false) {
    itemOrItems = [itemOrItems];
  }

  itemOrItems = _.cloneDeep(itemOrItems);

  var promises = itemOrItems.map(function(item) {
    return module._register(domain, item);
  });

  q.allSettled(promises)
    .then(function(results) {

      //result has => value === resolved/ state === 'fulfilled' / reason === error
      results = results.map(function(result, index) {
        return {
          registered: result.state === 'fulfilled',
          id: itemOrItems[index].id,
          compiled: result.state === 'fulfilled' ? result.value : null,
          error: result.reason ? result.reason : null
        };
      });

      if (isArray) {
        dfd.resolve(results);
      } else {
        dfd.resolve(results[0]);
      }
    });

  return dfd.promise;

};

//Register an item on the stack
CodeCompiler.prototype._register = function(domain, item) {

  var module = this;

  return this.validate(item)
    .then(function() {

      module.__preCompile(domain, item);

      var compiled = module.compile(item);

      if (compiled) {
        module.__preAdd(domain, compiled);

        var added = module._addToList(domain, compiled);
        module.events.emit('debug', module.itemName + ':registered', added, item.id);
        return compiled;
      } else {
        module.events.emit('warn', module.itemName + ':not:registered', item.id);
        throw new Error('not:registered');
      }

    })
    .catch(function(err) {
      module.events.emit('warn', module.itemName + ':not:registered', module.itemName + ':not:valid', item.id, err);
      throw err;
    });
};

//Registers phrases, extracting domain from id (TODO: Test)
CodeCompiler.prototype.registerWithoutDomain = function(items) {
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
CodeCompiler.prototype.validate = function(item) {
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
CodeCompiler.prototype.compile = function(itemOrItems) {
  var module = this;

  var isArray = Array.isArray(itemOrItems);

  if (isArray === false) {
    itemOrItems = [itemOrItems];
  }

  var compiledResults = itemOrItems.map(function(item) {
    return module._compile(item);
  });

  return isArray ? compiledResults : compiledResults[0];
};


//Creates a function based on a function body and some params.
CodeCompiler.prototype._evaluateCode = function(functionBody, params) {
  var functionParams = params ? params : [];

  var result = {
    fn: null,
    script: null,
    error: false
  };

  try {
    /* jshint evil:true */
    result.fn = Function.apply(null, functionParams.concat(functionBody));
    result.script = new vm.Script(functionBody, {
      displayErrors: true
    });
    this.events.emit('debug', this.itemName + ':evaluatecode:good');
  } catch (e) {
    this.events.emit('warn', this.itemName + ':evaluatecode:wrong_code', e);
    result.error = true;
  }

  return result;
};

//Iterates over the items to unregister
CodeCompiler.prototype.unregister = function(domain, itemOrItemIds) {
  var module = this;

  var isArray = Array.isArray(itemOrItemIds);

  if (isArray === false) {
    itemOrItemIds = [itemOrItemIds];
  }

  itemOrItemIds.forEach(function(item) {
    module.events.emit('debug', module.itemName + ':unregister:' + item.id);
    return module._unregister(domain, item);
  });
};

//Extracts the domain from a database item
CodeCompiler.prototype._extractDomainFromId = function(id) {
  return id.split('!')[0];
};



/********************************
  Mandatory implementations 
********************************/

CodeCompiler.prototype._compile = function(item) {
  //Implement freely
  return item;
};

CodeCompiler.prototype._addToList = function() {
  //Implement freely
  return true;
};

//Removes item from memory
CodeCompiler.prototype._unregister = function() {
  //Implement freely
};

/********************************
  Optional methods 
********************************/

//Pre compile call 
CodeCompiler.prototype.__preCompile = function() {

};

//Pre add call
CodeCompiler.prototype.__preAdd = function() {

};

module.exports = CodeCompiler;