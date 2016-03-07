'use strict';

var validator = require('jsonschema').validate;

var virtualDomainSchema = {
  'id': '/VirtualDomain',
  'type': 'object',
  'properties': {
    'id': {'type': 'string', 'required': true, 'minLength': 5, 'pattern': '^.+!.+$'},
    'name': {'type': 'string', 'required': false, 'minLength': 3},
    'author': {'type': 'string'},
    'version': {'type': 'string', 'required': false},
    'source_location': {'type': 'string'},
    'git': {'type': 'string'},
    'license': {'type': 'string'},
    'mock_middleware': {'type': 'boolean'},
    'validate_middleware': {'type': 'boolean'},
    'vd_dependencies': {'type': 'object'},
    '_apiRML': {'type': 'object'},
    'phrases' : { 
      'type' : 'array',
      'items' : {
        'type' : 'object'
      }
    },
    'snippets' : { 
      'type' : 'array',
      'items' : {
        'type' : 'object'
      }
    }
  }
};

function validate(virtualDomain) {

  var result = validator(virtualDomain, virtualDomainSchema);
  return new Promise(function(resolve, reject){
    if(result.errors && result.errors.length > 0){
      reject(result.errors);
    }else{
      resolve(virtualDomain);
    }
  });

}

module.exports = validate;