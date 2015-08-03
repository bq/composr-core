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

  describe('Phrases validation', function() {

    it('Validates correct models', function() {
      var goodPhraseModel = {
        url: 'test',
        get: {
          code: 'res.render(\'index\', {title: \'test\'});',
          doc: 'asd'
        }
      };

      expect(Phrases.validate(goodPhraseModel)).to.be.an('object');
      expect(Phrases.validate(goodPhraseModel).valid).to.equals(true);
    });

    it('Denies invalid models', function() {
      var badPhraseModel = {
        url: '',
        get: {
          code: 'res.render(\'index\', {title: \'test\'});',
          doc: ''
        }
      };

      expect(Phrases.validate(badPhraseModel)).to.be.an('object');
      expect(Phrases.validate(badPhraseModel).valid).to.equals(false);
      expect(Phrases.validate(badPhraseModel).errors).to.be.an('array');
      expect(Phrases.validate(badPhraseModel).errors.length).to.equals(1);
    });
  });

});