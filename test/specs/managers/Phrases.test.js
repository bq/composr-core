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
      expect(Phrases).to.have.property('dao');
      expect(Phrases).to.have.property('store');
      expect(Phrases).to.have.property('model');
      expect(Phrases).to.have.property('validator');
    });
  });

  describe('Phrases validation', function() {

    it('Validates correct models', function(done) {
      var goodPhraseModel = {
        url: 'test',
        version : '1.2.3',
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

    it('Denies invalid models (Missing url, version and invalid doc field)', function(done) {
      var badPhraseModel = {
        url: '',
        version : '',
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
          expect(result.errors.length).to.equals(3);

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
        version : '92.1.111',
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
      Phrases.resetItems();
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
      Phrases.resetItems();
    });

    it('Should count all the phrases', function() {
      expect(Phrases.count()).to.equals(5);
    });
  });

  describe('Find duplicated regexp over the phrases', function() {

    beforeEach(function() {
      Phrases.store.set({
        'mydomain': [{
          getRegexp : function() {
            return '^/?test/?$';
          }
        }, {
          getRegexp : function() {
            return '^/?test-route/?$';
          }
        }],
        'mydomain2': [{
          getRegexp : function() {
            return '^/?test/?$';
          }
        }, {
          getRegexp : function() {
            return '^/?test-route/?$';
          }
        }]
      });
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


  describe('Phrases registration', function() {

    beforeEach(function() {
      //Reset phrases for each test
      Phrases.resetItems();
    });

    it('should generate an id for a phrase without id', function(done) {
      var phrase = {
        url: 'thephrase/without/:id',
        version : '2.2.2',
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
            'model',
            'registered',
            'id'
          );
          expect(result.registered).to.equals(true);
          expect(result.id).to.equals('simpledomain!thephrase!without!:id-2.2.2');
          expect(result.model).to.respondTo('getId');
          expect(result.model.getUrl()).to.equals(phrase.url);
          expect(result.model.getId()).to.equals('simpledomain!thephrase!without!:id-2.2.2');
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
            'model',
            'error'
          );
          expect(result.registered).to.equals(true);
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
            'model',
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
        version : '3.3.3',
        id: 'random-id-1',
        get: {
          code: 'res.render(\'index\', {title: \'test\'});',
          doc: {}
        }
      };

      var similarPhrase = {
        url: 'test',
        version : '3.3.2',
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
      var phrase = _.cloneDeep(phrasesFixtures.correct[0]);

      Phrases.register('mydomain', phrase)
        .should.be.fulfilled
        .then(function(result) {
          expect(result.registered).to.equals(true);

          var candidates = Phrases.getPhrases('mydomain');

          expect(Object.keys(candidates).length).to.equals(1);

          var sureCandidate = Phrases.getById(result.id);
          expect(sureCandidate).to.be.a.instanceof(PhraseModel);
          expect(sureCandidate.getUrl()).to.equals(phrase.url);
        })
        .should.notify(done);
    });

    it('should not modify the passed objects', function(done) {
      var phraseToRegister = {
        url: 'test',
        version : '3.2.1',
        get: {
          code: 'res.render(\'index\', {title: \'test\'});',
          doc: {}
        }
      };

      Phrases.register('test-domain', phraseToRegister)
        .then(function(result) {
          expect(result.model).to.be.a.instanceof(PhraseModel);
          expect(result.registered).to.equals(true);
          //It does not add the ID to the original json
          expect(phraseToRegister.id).to.be.undefined;
          //But instead it generates it for the model
          expect(result.model.getId()).to.equals('test-domain!test-3.2.1');
          done();
        })
        .catch(done);
    });

    describe('Domain registration', function() {
      var thePhrases = _.cloneDeep(phrasesFixtures.correct);
      var existingPhraseId = '';

      beforeEach(function(done) {
        Phrases.register('my:test:domain', thePhrases)
          .then(function(res) {
            existingPhraseId = res[0].id;
            done();
          });
      });

      afterEach(function() {
        Phrases.resetItems();
      });

      it('should not return any phrase from other domain', function() {
        var phraseObtained = Phrases.getById('other:domain' + existingPhraseId);

        expect(phraseObtained).to.be.a('null');
      });

      it('should return the phrase from my domain', function() {
        var phraseObtained = Phrases.getById(existingPhraseId);

        expect(phraseObtained).to.be.a.instanceof(PhraseModel);
      });
    });
  });

  describe('Phrases unregistration', function() {
    var thePhrases = _.cloneDeep(phrasesFixtures.correct).map(function(item){
      item.id = null;
      return item;
    });

    var domain = 'random:domain:unregistration';
    var existingPhraseId = '';

    beforeEach(function(done) {
      Phrases.register(domain, thePhrases)
        .then(function(results){
          existingPhraseId = results[0].id;
        })
        .should.be.fulfilled.notify(done);
    });

    afterEach(function() {
      Phrases.resetItems();
    });

    it('should not be able to get an unregistered phrase', function() {
      var existingPhrase = Phrases.getById(existingPhraseId);

      expect(existingPhrase).to.be.an.instanceof(PhraseModel);

      Phrases.unregister(domain, existingPhraseId);

      var doesItExist = Phrases.getById(existingPhraseId);

      expect(doesItExist).to.equals(null);
    });

    it('Should unregister all the phrases', function() {
      var phrasesIds = Phrases.getPhrases(domain).map(function(phrase) {
        return phrase.getId();
      });

      expect(phrasesIds.length).to.be.above(0);

      Phrases.unregister(domain, phrasesIds);

      var savedPhrases = Phrases.getPhrases(domain);

      expect(savedPhrases.length).to.equals(0);

    });

  });
});