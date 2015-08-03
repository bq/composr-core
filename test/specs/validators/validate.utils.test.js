var VUtils = require('../../../src/lib/validators/validate.utils.js'),
  chai = require('chai'),
  sinon = require('sinon'),
  expect = chai.expect;

describe('Validator utils', function() {
  describe('validator API', function(){

    it('has the expected methods', function(){
      expect(VUtils).to.respondTo('isDefined');
      expect(VUtils).to.respondTo('isDefined');
      expect(VUtils).to.respondTo('failIfIsDefined');
      expect(VUtils).to.respondTo('isNotNull');
      expect(VUtils).to.respondTo('isValue');
      expect(VUtils).to.respondTo('isGreaterThan');
      expect(VUtils).to.respondTo('isGreaterThanOrEqual');
      expect(VUtils).to.respondTo('isValidUrl');
      expect(VUtils).to.respondTo('isValidBase64');
    });
  });

});