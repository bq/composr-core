var Publisher = require('../../src/lib/Publisher'),
  chai = require('chai'),
  sinon = require('sinon'),
  expect = chai.expect;

describe('Publisher', function() {
  describe('Publisher API', function() {
    it('exposes the expected methods', function() {
      expect(Publisher).to.respondTo('publish');
      expect(Publisher).to.respondTo('fetch');
      expect(Publisher).to.respondTo('remove');
    });
  });
});