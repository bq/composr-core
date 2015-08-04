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

  describe('Compile phrases', function(){

    it('should generate a regular expression for the url', function(){

    });

    it('should extract the pathparams for the url', function(){

    });

    it('should evaluate the function and mantain it in memory', function(){

    });

    it('should emit an event with information about the compilation', function(){

    });

  });

  describe('Get phrases', function(){

    it('should return all the registered phrases if no id is passed', function(){

    });

    it('should return the specified phrase by id', function(){

    });

    it('should not return any phrase if id is wrong', function(){

    });

  });

  describe('Phrases registration', function(){

    it('should allow to register an array of phrase models', function(){

    });

    it('should allow to register a single phrase model', function(){

    });

    it('should return the registered phrase model registered', function(){

    });

    it('should validate the phrase prior to registration', function(){

    });

    it('should call the compilation methods when registering a phrase', function(){

    });

    it('should emit a debug event when the phrase has been registered', function(){

    });

    it('should emit an error when the registering fails', function(){

    });

  });

  describe('Phrases unregistration', function(){

    it('should not remove an unregistered phrase', function(){

    });

    it('should unregister a registered phrase', function(){

    });

    it('cannot request a unregistered phrase', function(){

    });

    it('should emit a debug event with info about the unregistration', function(){

    });

    it('should emit an event for the unregistration', function(){

    });

  });

  describe('Phrases runner', function(){

    it('should not allow to run an unregistered phrase', function(){

    });

    it('should be able to register a phrase for running it', function(){

    });

    it('can execute a registered phrase', function(){

    });
    
  });


});