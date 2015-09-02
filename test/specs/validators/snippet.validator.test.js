var validator = require('../../../src/lib/validators/snippet.validator.js'),
  chai = require('chai'),
  sinon = require('sinon'),
  q = require('q'),
  expect = chai.expect;

var fixturesSnippets = require('../../fixtures/snippets');

describe('Snippet validator', function() {
  describe('Correct snippets', function() {

    it('should validate every correct snippet', function(done) {
      expect(fixturesSnippets.correct.length).to.be.above(0);

      var promises = fixturesSnippets.correct.map(function(snippet) {
        return validator(snippet);
      });

      q.all(promises)
        .then(function(){
          done();
        })
        .catch(function(err){
          console.log(err);
          done('Error');
        });
    });

  });

  describe('Incorrect snippets', function() {

    it('should fail with every incorrect snippet', function(done) {
      expect(fixturesSnippets.malformed.length).to.be.above(0);

      var promises = fixturesSnippets.malformed.map(function(snippet) {
        var dfd = q.defer();
        validator(snippet)
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
        .catch(function(err){
          console.log(err);
          done('Error');
        });
    });

  });

});