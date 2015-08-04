var Phrases = require('../../src/lib/Phrases'),
  chai = require('chai'),
  sinon = require('sinon'),
  _ = require('lodash'),
  expect = chai.expect;

var phrasesFixtures = require('../fixtures/phrases');

describe('== Phrases ==', function() {

  describe('Phrases API', function() {
    it('exposes the expected methods', function() {
      expect(Phrases).to.respondTo('validate');
      expect(Phrases).to.respondTo('run');
      expect(Phrases).to.respondTo('get');
      expect(Phrases).to.respondTo('_register');
      expect(Phrases).to.respondTo('_unregister');
      expect(Phrases).to.respondTo('compile');
      expect(Phrases).to.respondTo('_compile');
    });
  });

  describe('Phrases validation', function() {

    it('Validates correct models', function(done) {
      var goodPhraseModel = {
        url: 'test',
        get: {
          code: 'res.render(\'index\', {title: \'test\'});',
          doc: {}
        }
      };

      Phrases.validate(goodPhraseModel)
        .then(function(result) {
          expect(result).to.be.an('object');
          expect(result.valid).to.equals(true);
          done();
        })
        .catch(function(err) {
          console.log(err);
          done(err);
        });

    });

    it('Denies invalid models (Missing url and invalid doc field)', function(done) {
      var badPhraseModel = {
        url: '',
        get: {
          code: 'res.render(\'index\', {title: \'test\'});',
          doc: ''
        }
      };

      Phrases.validate(badPhraseModel)
        .then(function() {
          done('Error');
        })
        .catch(function(result) {
          expect(result).to.be.an('object');
          expect(result.valid).to.equals(false);
          expect(result.errors).to.be.an('array');
          expect(result.errors.length).to.equals(2);

          done();
        });

    });
  });

  describe('Compile phrases', function() {
    var stubEvents;

    beforeEach(function() {
      stubEvents = sinon.stub();
      //Mock the composr external methods
      Phrases.compile = Phrases.compile.bind(_.extend(Phrases, {
        events: {
          emit: stubEvents
        }
      }));

    });


    it('should compile a well formed phrase', function() {
      var phrase = phrasesFixtures.correct[0];
      var result = Phrases.compile(phrase);

      expect(result).to.include.keys(
        'url',
        'regexpReference',
        'codes'
      );

      expect(result.regexpReference).to.be.an('object');
      expect(result.codes).to.be.an('object');
      expect(result.regexpReference).to.include.keys(
        'params',
        'regexp'
      );
      expect(Object.keys(result.codes).length).to.be.above(0);

    });

    it('should generate a regular expression for the url', function() {
      var phrase = {
        url: 'test/:param/:optional?',
        get: {
          code: 'console.log(3);'
        }
      };

      var compiled = Phrases.compile(phrase);

      expect(compiled.regexpReference).to.be.defined;
      expect(compiled.regexpReference.regexp).to.be.defined;
    });

    it('should extract the pathparams for the url', function() {
      var phrase = {
        url: 'test/:param/:optional?',
        get: {
          code: 'console.log(3);'
        }
      };

      var compiled = Phrases.compile(phrase);

      expect(compiled.regexpReference).to.be.defined;
      expect(compiled.regexpReference.params.length).to.equals(2);
      expect(compiled.regexpReference.params[0]).to.equals('param');
      expect(compiled.regexpReference.params[1]).to.equals('optional?');
    });

    xit('should evaluate the function *only once* and mantain it in memory', function() {

    });

    it('should emit an event with information about the compilation', function() {
      var phrase = phrasesFixtures.correct[0];
      var result = Phrases.compile(phrase);

      expect(stubEvents.callCount).to.be.above(0);
      expect(stubEvents.calledWith('Phrases:compiled')).to.equals(true);
    });

    it('should allow passing a single phrase', function() {
      var compiled = Phrases.compile(phrasesFixtures.correct[0]);
      expect(Array.isArray(compiled)).to.equals(false);
    });

    it('should allow passing multiple phrases', function() {
      var compiledPhrases = Phrases.compile(phrasesFixtures.correct);
      expect(Array.isArray(compiledPhrases)).to.equals(true);
    });

  });

  xdescribe('Get phrases', function() {

    it('should return all the registered phrases if no id is passed', function() {

    });

    it('should return the specified phrase by id', function() {

    });

    it('should not return any phrase if id is wrong', function() {

    });

  });

  xdescribe('Phrases registration', function() {

    it('should allow to register an array of phrase models', function() {

    });

    it('should allow to register a single phrase model', function() {

    });

    it('should return the registered phrase model registered', function() {

    });

    it('should validate the phrase prior to registration', function() {

    });

    it('should call the compilation methods when registering a phrase', function() {

    });

    it('should emit a debug event when the phrase has been registered', function() {

    });

    it('should emit an error when the registering fails', function() {

    });

  });

  xdescribe('Phrases unregistration', function() {

    it('should not remove an unregistered phrase', function() {

    });

    it('should unregister a registered phrase', function() {

    });

    it('cannot request a unregistered phrase', function() {

    });

    it('should emit a debug event with info about the unregistration', function() {

    });

    it('should emit an event for the unregistration', function() {

    });

  });

  xdescribe('Phrases runner', function() {

    it('should not allow to run an unregistered phrase', function() {

    });

    it('should be able to register a phrase for running it', function() {

    });

    it('can execute a registered phrase', function() {

    });

  });


});