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
        .catch(function(err){
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

    it('should reject the validation if the path has duplicated names', function (done) {
      var phrase = {
        'url': 'my/phrase/:id/:id/:id',
        'version': '23.4.2',
        'get': {
          'code': 'console.log("a");',
          'doc': {

          }
        }
      };

      validator(phrase)
        .should.be.rejected
        .then(function(result){
          console.log(result)
          expect(result.length).to.equals(1);
          expect(result[0]).to.equals('error:phrase:url:syntax');
          done();
        });
    });
  });

  describe('Malicious phrases', function() {
    //@TODO: make core intelligent enough to deal with malicious phrases
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
