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

    it('Validates correct models', function(done) {
      var goodPhraseModel = {
        url: 'test',
        get: {
          code: 'res.render(\'index\', {title: \'test\'});',
          doc: {
          }
        }
      };

      Phrases.validate(goodPhraseModel)
        .then(function(result){
          expect(result).to.be.an('object');
          expect(result.valid).to.equals(true);
          done();
        })
        .catch(function(err){
          console.log(err);
          done(err);
        });

    });

    it('Denies invalid models', function(done) {
      var badPhraseModel = {
        url: '',
        get: {
          code: 'res.render(\'index\', {title: \'test\'});',
          doc: ''
        }
      };

      Phrases.validate(badPhraseModel)
        .then(function(){
          done('Error');
        })
        .catch(function(result){
          //console.log(result);
          expect(result).to.be.an('object');
          expect(result.valid).to.equals(false);
          expect(result.errors).to.be.an('array');
          expect(result.errors.length).to.equals(2);
      
          done();
        });

    });
  });

  describe('Phrases registration', function(){

  });

});