var PhraseManager = require('../../../src/lib/managers/Phrase'),
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

  beforeEach(function() {
    stubEvents = sinon.stub();

    Phrases = new PhraseManager({
      events: {
        emit: stubEvents
      }
    });
  });


  describe('Phrases API', function() {
    it('exposes the expected methods', function() {
      expect(Phrases).to.respondTo('configure');
      expect(Phrases).to.respondTo('validate');
      expect(Phrases).to.respondTo('_generateId');
      expect(Phrases).to.respondTo('runById');
      expect(Phrases).to.respondTo('runByPath');
      expect(Phrases).to.respondTo('_run');
      expect(Phrases).to.respondTo('_filterByRegexp');
      expect(Phrases).to.respondTo('_getPhrasesAsList');
      expect(Phrases).to.respondTo('_getPhraseIndexById');
      expect(Phrases).to.respondTo('resetItems');
      expect(Phrases).to.respondTo('getPhrases');
      expect(Phrases).to.respondTo('getById');
      expect(Phrases).to.respondTo('getByMatchingPath');
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

  describe('Phrase id generation', function() {
    var urlfixtures = [{
      url: 'test',
      domain: 'mydomain',
      expected: 'mydomain!test'
    }, {
      url: 'test/:user',
      domain: 'mydomain',
      expected: 'mydomain!test!:user'
    }, {
      url: 'test/:path/:path/:path/:path?/user',
      domain: 'anotherdomain',
      expected: 'anotherdomain!test!:path!:path!:path!:path?!user'
    }];

    it('Generates the correct ids for each phrase url', function() {
      urlfixtures.forEach(function(value) {
        var idGenerated = Phrases._generateId(value.url, value.domain);
        expect(idGenerated).to.equals(value.expected);
      });
    });

  });

  describe('Compile phrases', function() {

    it('should compile a well formed phrase', function() {
      var phrase = phrasesFixtures.correct[0];
      var result = Phrases.compile(phrase);

      expect(result).to.include.keys(
        'id',
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

    it('should compile a phrase with code instead of codehash', function() {
      var phrase = {
        url: 'thephrase/without/:id',
        get: {
          code: 'console.log(a);',
          doc: {}
        }
      };

      var compiled = Phrases.compile(phrase);
      expect(compiled.codes.get.fn).to.be.a('function');
    });

    it('should emit an event with information about the compilation', function() {
      var phrase = phrasesFixtures.correct[0];
      var result = Phrases.compile(phrase);

      expect(stubEvents.callCount).to.be.above(0);
      expect(stubEvents.calledWith('debug', 'phrase:compiled')).to.equals(true);
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

  describe('Reset phrases', function() {
    beforeEach(function() {
      Phrases.__phrases = {
        'testdomain': [{
          id: '1'
        }, {
          id: '2'
        }, {
          id: '3'
        }]
      };
    });

    afterEach(function() {
      Phrases.__phrases = {};
    });

    it('Has all the phrases initially', function() {
      expect(Object.keys(Phrases.__phrases).length).to.equals(1);
    });

    it('Resets the phrases', function() {
      Phrases.resetItems();
      expect(Object.keys(Phrases.__phrases).length).to.equals(0);
    });

    //TODO: emit an event when reseting the phrases, for debug purposes.

  });

  describe('Get phrases', function() {
    beforeEach(function() {
      Phrases.__phrases = {
        'testdomain': [{
          id: 'loginclient!:id!:name'
        }, {
          id: 'user'
        }],
        'other:domain': [{
          id: 'test-endpoint-a'
        }, {
          id: 'register/user/:email'
        }, {
          id: 'register/user/:email/2'
        }]
      };
    });

    afterEach(function() {
      Phrases.resetItems();
    });

    it('returns all the phrases for all the domains if no domain is provided', function() {
      var candidates = Phrases.getPhrases();
      expect(candidates.length).to.equals(5);
    });

    it('returns all the phrases for a single domain', function() {
      var candidates = Phrases.getPhrases('other:domain');
      expect(candidates.length).to.equals(3);
    });

  });

  describe('Get phrase index by id', function() {

    beforeEach(function() {
      Phrases.__phrases = {
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
          id: 'register/user/:email',
          url: 'url-b'
        }, {
          id: 'test-endpoint-a',
          url: 'url-b'
        }]
      };
    });

    afterEach(function() {
      Phrases.resetItems();
    });

    it('should return -1 if the phrase is not found', function() {
      var result = Phrases._getPhraseIndexById('testdomain', 'asdfg');
      expect(result).to.equals(-1);
    });

    it('should return the index of the phrase in the domain list', function() {
      var result = Phrases._getPhraseIndexById('testdomain', 'test-endpoint-a');
      expect(result).to.equals(0);
    });

    it('should return the index of the phrase on another domain', function() {
      var result = Phrases._getPhraseIndexById('other:domain', 'test-endpoint-a');
      expect(result).to.equals(1);
    });

  });

  describe('Get phrases by id', function() {

    beforeEach(function() {
      Phrases.__phrases = {
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
      };
    });

    afterEach(function() {
      Phrases.resetItems();
    });


    it('should return null if no domain and no id is passed', function() {
      var phrase = Phrases.getById();
      expect(phrase).to.equals(null);
    });

    it('should return null if no id is passed', function() {
      var phrase = Phrases.getById('other:domain');
      expect(phrase).to.equals(null);
    });

    it('should return the first matching phrase if no domain is passed', function() {
      var phrase = Phrases.getById('', 'test-endpoint-a');
      expect(phrase).to.be.an('object');
      expect(phrase.id).to.equals('test-endpoint-a');
      expect(phrase.url).to.equals('url-a');
    });

    it('should return the correct matching phrase if a domain is passed', function() {
      var phrase = Phrases.getById('other:domain', 'test-endpoint-a');
      expect(phrase).to.be.an('object');
      expect(phrase.id).to.equals('test-endpoint-a');
      expect(phrase.url).to.equals('url-b');
    });

    it('should not return phrases if the domain is wrong', function() {
      var phrase = Phrases.getById('my-domain-not-existing', 'test-endpoint-a');
      expect(phrase).to.be.a('null');
    });

    it('should not return any phrase if id is wrong', function() {
      var phraseObtained = Phrases.getById('other:domain', 'test-test-test');
      expect(phraseObtained).to.be.a('null');
    });

  });

  describe('Count phrases', function() {

    beforeEach(function() {
      Phrases.__phrases = {
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
      };
    });

    afterEach(function() {
      Phrases.resetItems();
    });

    it('Should count all the phrases', function() {
      expect(Phrases.count()).to.equals(5);
    });

  });

  describe('Add to list', function() {

    beforeEach(function() {
      Phrases.resetItems();
    });

    it('Adds a phrase with a domain', function() {
      var added = Phrases._addToList('addtolist:domain', {
        id: 'serious-phrase',
        value: 'serious'
      });

      expect(Phrases.getPhrases('addtolist:domain').length).to.equals(1);
      expect(Phrases.getById('addtolist:domain', 'serious-phrase')).to.be.an('object');
      expect(Phrases.getById('addtolist:domain', 'serious-phrase')).to.include.keys(
        'id',
        'value'
      );
      expect(added).to.equals(true);
    });

    it('Does not add an empty phrase', function() {
      var added = Phrases._addToList('addtolist:domain', null);

      expect(Phrases.getPhrases('addtolist:domain')).to.be.a('null');
      expect(added).to.equals(false);
    });

    it('Does not add non objects', function() {
      var added = Phrases._addToList('addtolist:domain', 'Hey');

      expect(Phrases.getPhrases('addtolist:domain')).to.be.a('null');
      expect(added).to.equals(false);
    });

    it('Does not add a phrase without id', function() {
      var added = Phrases._addToList('addtolist:domain', {});

      expect(Phrases.getPhrases('addtolist:domain')).to.be.a('null');
      expect(added).to.equals(false);
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
      spyGenerateId = sinon.spy(Phrases, '_generateId');
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
        spyRegister = sinon.spy(Phrases, '_register');
        spyCompile = sinon.spy(Phrases, 'compile');
        spyValidate = sinon.spy(Phrases, 'validate');
        spy_compile = sinon.spy(Phrases, '_compile');
        spyAddToList = sinon.spy(Phrases, '_addToList');
        spyPreCompile = sinon.spy(Phrases, '__preCompile');
        spyPreAdd = sinon.spy(Phrases, '__preAdd');
      });

      afterEach(function() {
        spyRegister.restore();
        spyCompile.restore();
        spyValidate.restore();
        spy_compile.restore();
        spyAddToList.restore();
        spyPreCompile.restore();
        spyPreAdd.restore();
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
      var stubCompile;

      beforeEach(function() {
        stubCompile = sinon.stub(Phrases, 'compile', function() {
          return false;
        });
      });

      afterEach(function() {
        stubCompile.restore();
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