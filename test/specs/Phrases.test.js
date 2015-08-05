var Phrases = require('../../src/lib/Phrases'),
  _ = require('lodash'),
  chai = require('chai'),
  sinon = require('sinon'),
  chaiAsPromised = require('chai-as-promised'),
  expect = chai.expect,
  should = chai.should();

chai.use(chaiAsPromised);

var phrasesFixtures = require('../fixtures/phrases');
var utilsPromises = require('../utils/promises');

describe('== Phrases ==', function() {

  describe('Phrases API', function() {
    it('exposes the expected methods', function() {
      expect(Phrases).to.respondTo('validate');
      expect(Phrases).to.respondTo('run');
      expect(Phrases).to.respondTo('get');
      expect(Phrases).to.respondTo('register');
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

      Phrases.events = {
        emit: stubEvents
      };

    });


    it('should compile a well formed phrase', function() {
      var phrase = phrasesFixtures.correct[0];
      var result = Phrases.compile(phrase);

      expect(result).to.include.keys(
        'url',
        'regexpReference',
        'codes',
        'id'
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

  describe('Phrases registration', function() {
    var stubEvents;

    beforeEach(function() {
      stubEvents = sinon.stub();
      //Mock the composr external methods
      Phrases.events = {
        emit: stubEvents
      };

      //Reset phrases for each test
      Phrases.__phrases = [];
    });

    it('should allow to register an array of phrase models', function(done) {
      var phrases = phrasesFixtures.correct;

      Phrases.register(phrases)
        .then(function(result) {
          expect(result).to.be.an('array');
          expect(result.length).to.equals(1);
        })
        .should.be.fulfilled.notify(done);
    });

    it('should allow to register a single phrase model', function(done) {
      var phrase = phrasesFixtures.correct[0];

      Phrases.register(phrase)
        .then(function(result) {
          expect(result).to.be.an('object');
        })
        .should.be.fulfilled.notify(done);
    });

    it('should return the registered state when it registers correctly', function(done) {
      var phrase = phrasesFixtures.correct[0];

      Phrases.register(phrase)
        .then(function(result) {
          expect(result).to.be.an('object');
          expect(result).to.include.keys(
            'registered',
            'id',
            'error'
          );
          expect(result.id).to.equals(phrase.id);
          expect(result.error).to.equals(null);
        })
        .should.be.fulfilled.notify(done);
    });

    it('should return the registered state when it does not register', function(done) {
      var phrase = phrasesFixtures.malformed[0];

      Phrases.register(phrase)
        .then(function(result) {
          expect(result).to.be.an('object');
          expect(result).to.include.keys(
            'registered',
            'id',
            'error'
          );
          expect(result.id).to.equals(phrase.id);
          expect(result.error).not.to.equals(null);
        })
        .should.be.fulfilled.notify(done);
    });

    describe('Secure methods called', function() {
      var spyCompile, spyValidate, spy_compile;

      beforeEach(function() {
        spyCompile = sinon.spy(Phrases, 'compile');
        spyValidate = sinon.spy(Phrases, 'validate');
        spy_compile = sinon.spy(Phrases, '_compile');
      });

      afterEach(function() {
        spyCompile.restore();
        spyValidate.restore();
        spy_compile.restore();
      });

      it('should call the compilation and validation methods when registering a phrase', function(done) {

        Phrases.register(phrasesFixtures.correct[0])
          .then(function() {
            expect(spyCompile.callCount).to.equals(1);
            expect(spy_compile.callCount).to.equals(1);
            expect(spyValidate.callCount).to.equals(1);
          })
          .should.be.fulfilled.notify(done);
      });

    });

    it('should emit a debug event when the phrase has been registered', function(done) {
      Phrases.register(phrasesFixtures.correct[0])
        .then(function() {
          expect(stubEvents.callCount).to.be.above(0);
          expect(stubEvents.calledWith('debug', 'phrase:registered')).to.equals(true);
        })
        .should.be.fulfilled.notify(done);
    });

    it('should emit an error when the registering fails because the validation fails', function(done) {
      Phrases.register(phrasesFixtures.malformed[0])
        .then(function() {
          expect(stubEvents.callCount).to.be.above(0);
          expect(stubEvents.calledWith('phrase:not:registered')).to.equals(true);
        })
        .should.be.rejected.notify(done);
    });

    describe('Compilation fail', function() {
      var stubCompile;

      beforeEach(function() {
        stubCompile = sinon.stub(Phrases, 'compile', utilsPromises.rejectedPromise);
      });

      afterEach(function() {
        stubCompile.restore();
      });

      it('should emit an error when the registering fails because the compilation fails', function(done) {
        Phrases.register(phrasesFixtures.correct[0])
          .then(function() {
            expect(stubEvents.callCount).to.be.above(0);
            expect(stubEvents.calledWith('phrase:not:registered')).to.equals(true);
          })
          .should.be.rejected.notify(done);
      });
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

  describe('Domain extraction', function() {

    var testItems = [{
      id: 'booqs:demo!loginuser',
      value: 'booqs:demo'
    }, {
      id: 'test-client!myphrase!:parameter',
      value: 'test-client'
    }, {
      id: 'booqs:demo!bookWarehouseDetailMock!:id',
      value: 'booqs:demo'
    }];

    it('Extracts all the domains correctly', function() {
      testItems.forEach(function(phrase) {
        expect(Phrases._extractPhraseDomain(phrase)).to.equals(phrase.value);
      });
    });

  })


});