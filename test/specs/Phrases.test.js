var Phrases = require('../../src/lib/Phrases'),
  chai = require('chai'),
  sinon = require('sinon'),
  expect = chai.expect;

describe('== Phrases ==', function() {
  describe('Phrases API', function() {
    it('exposes the expected methods', function() {
      expect(Phrases).to.respondTo('validate');
      expect(Phrases).to.respondTo('run');
      expect(Phrases).to.respondTo('get');
      expect(Phrases).to.respondTo('_register');
      expect(Phrases).to.respondTo('_unregister');
      expect(Phrases).to.respondTo('_compile');
    });
  });

});