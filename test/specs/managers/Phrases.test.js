var PhraseManager = require('../../../src/lib/managers/Phrase'),
  PhraseModel = require('../../../src/lib/models/PhraseModel'),
  _ = require('lodash'),
  chai = require('chai'),
  sinon = require('sinon'),
  chaiAsPromised = require('chai-as-promised'),
  expect = chai.expect,
  should = chai.should();

chai.use(chaiAsPromised);

var phrasesFixtures = require('../../fixtures/phrases');
var utilsPromises = require('../../utils/promises');

describe('== Phrases ==', function() {
  var stubEvents, Phrases;
  var sandbox = sinon.sandbox.create();

  beforeEach(function() {
    stubEvents = sinon.stub();

    Phrases = new PhraseManager({
      events: {
        emit: stubEvents
      }
    });
  });

  afterEach(function(){
    sandbox.restore();
  });

  describe('Phrases API', function() {
    it('exposes the expected methods', function() {
      expect(Phrases).to.respondTo('configure');
      expect(Phrases).to.respondTo('validate');
      expect(Phrases).to.respondTo('runById');
      expect(Phrases).to.respondTo('runByPath');
      expect(Phrases).to.respondTo('_filterByRegexp');
      expect(Phrases).to.respondTo('getPhrases');
      expect(Phrases).to.respondTo('getByMatchingPath');
      expect(Phrases).to.respondTo('count');
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

    it('should compile a well formed phrase', function() {
      var phrase = phrasesFixtures.correct[0];
      var result = Phrases.compile('test:domain', phrase);

      expect(result).to.be.an.instanceof(PhraseModel);
    });

    it('should generate a regular expression for the url', function() {
      var phrase = {
        url: 'test/:param/:optional?',
        get: {
          code: 'console.log(3);'
        }
      };

      var compiled = Phrases.compile('test:domain', phrase);

      expect(compiled.getRegexpReference()).to.be.defined;
      expect(compiled.getRegexp()).to.be.defined;
    });


    it('should emit an event with information about the compilation', function() {
      var phrase = phrasesFixtures.correct[0];
      var result = Phrases.compile('test:domain', phrase);

      expect(stubEvents.callCount).to.be.above(0);
      expect(stubEvents.calledWith('debug', 'phrase:compiled')).to.equals(true);
    });

    it('should allow passing a single phrase', function() {
      var compiled = Phrases.compile('test:domain', phrasesFixtures.correct[0]);
      expect(Array.isArray(compiled)).to.equals(false);
    });

    it('should allow passing multiple phrases', function() {
      var compiledPhrases = Phrases.compile('test:domain', phrasesFixtures.correct);
      expect(Array.isArray(compiledPhrases)).to.equals(true);
    });

  });

  describe('Reset phrases', function() {

    it('Calls store reset when calling phrases reset', function(){
      var spyStore = sandbox.spy(Phrases.store, 'reset');
      Phrases.reset();
      expect(spyStore.callCount).to.equals(1);
    });
  });


  describe('Count phrases', function() {

    beforeEach(function() {
      Phrases.store.set({
        'testdomain': [{
          id: 'test-endpoint-a',
          url: 'url-a'
        }, {
          id: 'loginclient!:id!:name',
          url: 'url-a'
        }, {
          id: 'user',
          url: 'url-a'
        }],
        'other:domain': [{
          id: 'test-endpoint-a',
          url: 'url-b'
        }, {
          id: 'register/user/:email',
          url: 'url-b'
        }]
      });
    });

    afterEach(function() {
      Phrases.store.reset();
    });

    it('Should count all the phrases', function() {
      expect(Phrases.count()).to.equals(5);
    });

  });

  describe('Find duplicated regexp over the phrases', function() {

    beforeEach(function() {
      Phrases.__phrases = {
        'mydomain': [{
          regexpReference: {
            regexp: '^/?test/?$'
          }
        }, {
          regexpReference: {
            regexp: '^/?test-route/?$'
          }
        }],
        'mydomain2': [{
          regexpReference: {
            regexp: '^/?test/?$'
          }
        }, {
          regexpReference: {
            regexp: '^/?test-route/?$'
          }
        }]
      }
    });

    afterEach(function() {
      Phrases.resetItems();
    });

    it('should find 2 items duplicated for all domains', function() {
      var candidates = Phrases._filterByRegexp('', '^/?test/?$');
      expect(candidates.length).to.equals(2);
    });

    it('should find 1 items duplicated for 1 domain', function() {
      var candidates = Phrases._filterByRegexp('mydomain', '^/?test/?$');
      expect(candidates.length).to.equals(1);
    });

    it('Should not find any candidate for a missing regexp', function() {
      var candidates = Phrases._filterByRegexp('', 'asd');
      expect(candidates.length).to.equals(0);
    });

    it('Should not find any candidate for a missing domain', function() {
      var candidates = Phrases._filterByRegexp('nodomain', '^/?test/?$');
      expect(candidates.length).to.equals(0);
    });

  });

  describe('Get phrases as list', function() {

    beforeEach(function() {
      Phrases.__phrases = {
        'mydomain': [{
          id: 'id1',
          url: 'test'
        }, {
          id: 'id2',
          url: 'test'
        }],
        'test-domain': [{
          id: 'id1',
          url: 'test'
        }, {
          id: 'id2',
          url: 'test'
        }, {
          id: 'id3',
          url: 'test'
        }]
      }
    });

    afterEach(function() {
      Phrases.resetItems();
    });

    it('Returns a flattened array with all the phrases', function() {
      var list = Phrases._getPhrasesAsList();
      expect(list.length).to.equals(5);
    });

    it('Returns a flattened array for a single domain', function() {
      var list = Phrases._getPhrasesAsList('test-domain');
      expect(list.length).to.equals(3);
    });

    it('Returns an empty list for a missing domain', function() {
      var list = Phrases._getPhrasesAsList('nodomain');
      expect(list.length).to.equals(0);
    });

  });

  describe('Phrases registration', function() {
    var spyGenerateId;

    beforeEach(function() {
      spyGenerateId = sandbox.spy(Phrases, '_generateId');
      //Reset phrases for each test
      Phrases.resetItems();
    });

    afterEach(function() {
      spyGenerateId.restore();
    });

    it('should allow to register an array of phrase models', function(done) {
      var phrases = phrasesFixtures.correct;

      Phrases.register('mydomain', phrases)
        .should.be.fulfilled
        .then(function(result) {
          expect(result).to.be.an('array');
          expect(result.length).to.equals(2);
          expect(spyGenerateId.callCount).to.be.above(0);
        })
        .should.notify(done);
    });

    it('Should reject if the domain is missing', function(done) {
      var phrases = phrasesFixtures.correct;

      Phrases.register(null, phrases)
        .should.be.rejected.notify(done);
    });

    it('Should reject if the phrases are missing', function(done) {

      Phrases.register('test', null)
        .should.be.rejected.notify(done);
    });

    it('should allow to register a single phrase model', function(done) {
      var phrase = phrasesFixtures.correct[0];

      Phrases.register('mydomain', phrase)
        .should.be.fulfilled
        .then(function(result) {
          expect(result).to.be.an('object');
        })
        .should.notify(done);
    });

    it('should generate an id for a phrase without id', function(done) {
      var phrase = {
        url: 'thephrase/without/:id',
        get: {
          code: 'console.log(a);',
          doc: {}
        }
      };

      Phrases.register('simpledomain', phrase)
        .should.be.fulfilled
        .then(function(result) {
          expect(result).to.be.an('object');
          expect(result).to.include.keys(
            'id',
            'registered',
            'compiled'
          );
          expect(result.registered).to.equals(true);
          expect(result.id).to.equals('simpledomain!thephrase!without!:id');
          expect(result.compiled).to.include.keys(
            'url',
            'regexpReference',
            'codes'
          );
          expect(result.compiled.url).to.equals(phrase.url);
          expect(result.compiled.id).to.equals('simpledomain!thephrase!without!:id');
        })
        .should.notify(done);
    });

    it('should emit a debug event when the phrase has been registered', function(done) {
      Phrases.register('testdomain', phrasesFixtures.correct[0])
        .should.be.fulfilled
        .then(function() {
          expect(stubEvents.callCount).to.be.above(0);
          expect(stubEvents.calledWith('debug', 'phrase:registered')).to.equals(true);
        })
        .should.be.fulfilled.notify(done);
    });

    it('should return the registered state when it registers correctly', function(done) {
      var phrase = phrasesFixtures.correct[0];

      Phrases.register('mydomain', phrase)
        .should.be.fulfilled
        .then(function(result) {
          expect(result).to.be.an('object');
          expect(result).to.include.keys(
            'registered',
            'id',
            'compiled',
            'error'
          );
          expect(result.id).to.equals(phrase.id);
          expect(result.registered).to.equals(true);
          expect(result.compiled).to.include.keys(
            'url',
            'regexpReference',
            'codes'
          );
          expect(result.error).to.equals(null);
        })
        .should.notify(done);
    });

    it('should return the registered state when it does NOT register', function(done) {
      var phrase = phrasesFixtures.malformed[0];

      Phrases.register('mydomain', phrase)
        .should.be.fulfilled
        .then(function(result) {
          expect(result).to.be.an('object');
          expect(result).to.include.keys(
            'registered',
            'id',
            'compiled',
            'error'
          );
          expect(result.id).to.equals(phrase.id);
          expect(result.registered).to.equals(false);
          expect(result.error).not.to.equals(null);
        })
        .should.be.fulfilled.notify(done);
    });

    it('should warn when various phrases matches the same regular expression', function(done) {
      var phrase = {
        url: 'test',
        id: 'random-id-1',
        get: {
          code: 'res.render(\'index\', {title: \'test\'});',
          doc: {}
        }
      };

      var similarPhrase = {
        url: 'test',
        id: 'random-id-2',
        get: {
          code: 'res.render(\'index\', {title: \'test\'});',
          doc: {}
        }
      };

      Phrases.register('mydomain', phrase)
        .should.be.fulfilled
        .then(function(result) {
          return Phrases.register('mydomain', phrase);
        })
        .then(function(result) {
          expect(stubEvents.calledWith('warn', 'phrase:path:duplicated')).to.equals(true);
        })
        .should.notify(done);
    });

    it('should be returnable over the registered phrases', function(done) {
      var phrase = phrasesFixtures.correct[0];
      var phraseId = phrase.id;

      Phrases.register('mydomain', phrase)
        .should.be.fulfilled
        .then(function(result) {
          expect(result.registered).to.equals(true);

          var candidates = Phrases.getPhrases('mydomain');

          expect(Object.keys(candidates).length).to.equals(1);

          var sureCandidate = Phrases.getById('mydomain', phraseId);

          expect(sureCandidate).to.include.keys(
            'url',
            'id',
            'regexpReference',
            'codes'
          );
          expect(sureCandidate.id).to.equals(phraseId);
        })
        .should.notify(done);
    });

    it('should not modify the passed objects', function(done) {
      var phraseToRegister = {
        url: 'test',
        get: {
          code: 'res.render(\'index\', {title: \'test\'});',
          doc: {}
        }
      };

      Phrases.register('test-domain', phraseToRegister)
        .then(function(result) {
          expect(phraseToRegister.id).to.be.undefined;
          done();
        })
        .catch(done);
    });

    describe('Secure methods called', function() {
      var spyCompile, spyValidate, spy_compile, spyRegister, spyAddToList,
        spyPreCompile, spyPreAdd;

      beforeEach(function() {
        spyRegister = sandbox.spy(Phrases, '_register');
        spyCompile = sandbox.spy(Phrases, 'compile');
        spyValidate = sandbox.spy(Phrases, 'validate');
        spy_compile = sandbox.spy(Phrases, '_compile');
        spyAddToList = sandbox.spy(Phrases, '_addToList');
        spyPreCompile = sandbox.spy(Phrases, '__preCompile');
        spyPreAdd = sandbox.spy(Phrases, '__preAdd');
      });

      it('should call the compilation and validation methods when registering a phrase', function(done) {

        Phrases.register('testdomain', phrasesFixtures.correct[0])
          .should.be.fulfilled
          .then(function() {
            expect(spyCompile.callCount).to.equals(1);
            expect(spy_compile.callCount).to.equals(1);
            expect(spyValidate.callCount).to.equals(1);
            expect(spyPreCompile.callCount).to.equals(1);
            expect(spyPreAdd.callCount).to.equals(1);
          })
          .should.be.fulfilled.notify(done);
      });

      it('should call the _register method with the domain', function(done) {

        Phrases.register('testingdomain:test', phrasesFixtures.correct[0])
          .should.be.fulfilled
          .then(function() {
            expect(spyRegister.callCount).to.equals(1);
            expect(spyRegister.calledWith('testingdomain:test', phrasesFixtures.correct[0])).to.equals(true);
          })
          .should.be.fulfilled.notify(done);
      });

      it('should call the _addToList method with the domain', function(done) {

        Phrases.register('testingdomain:test', phrasesFixtures.correct[0])
          .should.be.fulfilled
          .then(function() {
            expect(spyAddToList.callCount).to.equals(1);
            expect(spyAddToList.calledWith('testingdomain:test')).to.equals(true);
          })
          .should.be.fulfilled.notify(done);
      });

    });

    describe('Validation fail', function() {

      it('should emit an error when the registering fails because the validation fails', function(done) {
        Phrases.register('testdomain', phrasesFixtures.malformed[0])
          .should.be.fulfilled
          .then(function() {
            expect(stubEvents.callCount).to.be.above(0);
            expect(stubEvents.calledWith('warn', 'phrase:not:registered')).to.equals(true);
          })
          .should.be.fulfilled.notify(done);
      });

      it('should return not registered when the registering fails because the validation fails', function(done) {
        Phrases.register('testdomain', phrasesFixtures.malformed[0])
          .should.be.fulfilled
          .then(function(result) {
            expect(result.registered).to.equals(false);
          })
          .should.be.fulfilled.notify(done);
      });

    });

    describe('Compilation fail', function() {
      beforeEach(function() {
        sandbox.stub(Phrases, 'compile', function() {
          return false;
        });
      });

      it('should emit an error when the registering fails because the compilation fails', function(done) {
        Phrases.register('testdomain', phrasesFixtures.correct[0])
          .then(function() {
            expect(stubEvents.callCount).to.be.above(0);
            expect(stubEvents.calledWith('warn', 'phrase:not:registered')).to.equals(true);
            done();
          });
      });

      it('should return the unregistered state when the compilation fails', function(done) {
        Phrases.register('testdomain', phrasesFixtures.correct[0])
          .should.be.fulfilled
          .then(function(result) {
            expect(result.registered).to.equals(false);
          })
          .should.notify(done);
      });
    });

    describe('Domain registration', function() {
      var existingPhraseId = phrasesFixtures.correct[0].id;

      beforeEach(function(done) {
        Phrases.register('mydomain', phrasesFixtures.correct)
          .then(function(res) {
            done();
          });
      });

      afterEach(function() {
        Phrases.resetItems();
      });

      it('should not return any phrase from other domain', function() {
        var phraseObtained = Phrases.getById('other:domain', existingPhraseId);

        expect(phraseObtained).to.be.a('null');
      });

      it('should return the phrase from my domain', function() {
        var phraseObtained = Phrases.getById('mydomain', existingPhraseId);

        expect(phraseObtained).to.include.keys(
          'url',
          'regexpReference',
          'codes',
          'id'
        );
      });
    });

  });

  describe('Phrases unregistration', function() {
    var domain = 'random:domain:unregistration';

    beforeEach(function(done) {
      Phrases.register(domain, phrasesFixtures.correct)
        .should.be.fulfilled.notify(done);
    });

    afterEach(function() {
      Phrases.resetItems();
    });

    it('should not be able to get an unregistered phrase', function() {
      var existingPhraseId = phrasesFixtures.correct[0].id;
      var existingPhrase = Phrases.getById(domain, existingPhraseId);

      expect(existingPhrase).to.be.a('object');

      Phrases.unregister(domain, existingPhraseId);

      var doesItExist = Phrases.getById(domain, existingPhraseId);

      expect(doesItExist).to.equals(null);

    });

    it('Should unregister all the phrases', function() {
      var phrasesIds = Phrases.getPhrases(domain).map(function(phrase) {
        return phrase.id;
      });

      expect(phrasesIds.length).to.be.above(0);

      Phrases.unregister(domain, phrasesIds);

      var savedPhrases = Phrases.getPhrases(domain);

      expect(savedPhrases.length).to.equals(0);

    });

  });
});