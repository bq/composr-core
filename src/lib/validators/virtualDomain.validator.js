'use strict'

var validator = require('jsonschema').validate
var utils = require('../utils')
var semver = require('semver')

var virtualDomainSchema = {
  'id': '/VirtualDomain',
  'type': 'object',
  'properties': {
    'api_id': {'type': 'string', 'required': true, 'minLength': 5},
    'name': {'type': 'string', 'required': false, 'minLength': 3},
    'author': {'type': 'string'},
    'version': {'type': 'string', 'required': true},
    'source_location': {'type': 'string'},
    'git': {'type': 'string'},
    'license': {'type': 'string'},
    'mock_middleware': {'type': 'boolean'},
    'validate_middleware': {'type': 'boolean'},
    'vd_dependencies': {'type': 'object'},
    '_apiRML': {'type': 'object'},
    'phrases': {
      'type': 'array',
      'items': {
        'type': 'object'
      }
    },
    'snippets': {
      'type': 'array',
      'items': {
        'type': 'object'
      }
    }
  }
}

function validate (virtualDomain) {
  return new Promise(function (resolve, reject) {
    var result = validator(virtualDomain, virtualDomainSchema)

    var errors = result.errors

    var errorAccumulator = utils.errorAccumulator(errors)

    errorAccumulator(semver.valid, virtualDomain.version, 'incorrect:virtualDomain:version')

    if (errors.length > 0) {
      reject(errors)
    } else {
      resolve(virtualDomain)
    }
  })
}

module.exports = validate
