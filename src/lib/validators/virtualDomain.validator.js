'use strict';

var q = require('q');
var validator = require('jsonschema').validate;

var virtualDomainSchema = {
  'id': '/VirtualDomain',
  'type': 'object',
  'properties': {
    'id': {'type': 'string', 'required': true, minLength: 5},
    'name': {'type': 'string', 'required': true, minLength: 3},
    'author': {'type': 'string'},
    'version': {'type': 'string', 'required': true},
    'source_location': {'type': 'string'},
    'git': {'type': 'string'},
    'license': {'type': 'string'},
    'mock_middleware': {'type': 'boolean'},
    'validate_middleware': {'type': 'boolean'},
    'vd_dependencies': {'type': 'object'},
    '_apiRML': {'type': 'object'}
  }
};

function validate(virtualDomain) {
  var dfd = q.defer();

  var result = validator(virtualDomain, virtualDomainSchema);
  if (result.errors && result.errors.length > 0) {
    dfd.reject(result.errors);
  }
  dfd.resolve(virtualDomain);

  return dfd.promise;
};

module.exports = validate;