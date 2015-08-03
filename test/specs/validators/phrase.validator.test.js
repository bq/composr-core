var validator = require('../../../src/lib/validators/phrase.validator.js'),
  chai = require('chai'),
  sinon = require('sinon'),
  expect = chai.expect;

var fixturesPhrases = require('../../fixtures/phrases');

describe('Phrase validator', function() {
  describe('Correct phrases', function(){

    it('should validate every correct phrase', function(){

      expect(fixturesPhrases.correct.length).to.be.above(0);
      
      fixturesPhrases.correct.forEach(function(phrase){
        expect(validator(phrase).length).to.equals(0);
      });

    });

  });

});