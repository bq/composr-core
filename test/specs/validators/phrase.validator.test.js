var validator = require('../../../src/lib/validators/phrase.validator.js'),
  chai = require('chai'),
  sinon = require('sinon'),
  q = require('q'),
  expect = chai.expect;

var fixturesPhrases = require('../../fixtures/phrases');

describe('Phrase validator', function() {
  describe('Correct phrases', function() {

    it('should validate every correct phrase', function(done) {
      expect(fixturesPhrases.correct.length).to.be.above(0);

      var promises = fixturesPhrases.correct.map(function(phrase) {
        return validator(phrase);
      });

      q.all(promises)
        .then(function(){
          done();
        })
        .catch(function(){
          done('Error');
        });
    });

  });

  describe('Incorrect phrases', function() {

    it('should fail with every incorrect phrase', function(done) {
      expect(fixturesPhrases.malformed.length).to.be.above(0);

      var promises = fixturesPhrases.malformed.map(function(phrase) {
        var dfd = q.defer();
        validator(phrase)
          .then(dfd.reject)
          .catch(function(errors){
            expect(errors.length).to.be.above(0);
            dfd.resolve();
          });

        return dfd.promise;
      });
      q.all(promises)
        .then(function(){
          done();
        })
        .catch(function(){
          done('Error');
        });
    });
  });

  describe('Malicious phrases', function() {

    it.skip('should not validate any malicious phrase', function(done) {
      expect(fixturesPhrases.malicious.length).to.be.above(0);

      var promises = fixturesPhrases.malicious.map(function(phrase) {
        return validator(phrase);
      });
      q.all(promises)
        .then(function(){
          done('Error');
        })
        .catch(function(){
          done();
        });
    });
  });

});
