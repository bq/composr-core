'use strict';

var q = require('q');
var vm = require('vm');
var uglifyJs = require('uglify-js');
var currifiedToArrayPromise = require('../utils/currifiedToArrayPromise');

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
CodeCompiler.prototype._register = function(domain, item) {

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
CodeCompiler.prototype.compile = function(domain, itemOrItems) {
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


//Creates a function based on a function body and some params.
CodeCompiler.prototype._evaluateCode = function(functionBody, params, debugFilePath) {

  var functionParams = params ? params : [];

  var result = {
    fn: null,
    script: null,
    error: false,
    code: functionBody
  };

  /**
   * Optimization code to run in VM
   */

  try {
    /* jshint evil:true */

    var optimized = this.__codeOptimization(functionBody);

    result.fn = Function.apply(null, functionParams.concat(optimized));
    var options = {
      displayErrors: true
    };

    if (debugFilePath) {
      options.filename = debugFilePath;
    }

    result.script = new vm.Script(optimized, options);

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
CodeCompiler.prototype._extractDomainFromId = function(id) {
  return id.split('!')[0];
};

/********************************
  Mandatory implementations
********************************/

CodeCompiler.prototype._compile = function(domain, item) {
  //Implement freely
  this.events.emit('warn', '_compile not implemented');
  return item;
};

CodeCompiler.prototype._addToList = function() {
  //Implement freely
  this.events.emit('warn', '_addToList not implemented');
  return true;
};

//Removes item from memory
CodeCompiler.prototype._unregister = function() {
  //Implement freely
  this.events.emit('warn', '_unregister not implemented');
};

/********************************
  Optional methods
********************************/

//Pre compile call
CodeCompiler.prototype.__preCompile = function() {
  this.events.emit('warn', '__preCompile not implemented');
};

//Pre add call
CodeCompiler.prototype.__preAdd = function() {
  this.events.emit('warn', '__preAdd not implemented');
};


// Code optimization
CodeCompiler.prototype.__codeOptimization = function(code) {
  var optimized = uglifyJs.minify(code, {
    fromString: true,
    mangle: {
      sort: true
    },
    compress: {
      sequences: true,
      properties: true,
      dead_code: true,
      drop_debugger: true,
      conditionals: true,
      evaluate: true,
      booleans: true,
      loops: true,
      unused: true,
      if_return: true,
      join_vars: true,
      cascade: true,
      drop_console: false
    }
  });


  return optimized.code;
};

module.exports = CodeCompiler;
