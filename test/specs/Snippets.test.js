var Snippets = require('../../src/lib/Snippets'),
  _ = require('lodash'),
  chai = require('chai'),
  sinon = require('sinon'),
  q = require('q'),
  chaiAsPromised = require('chai-as-promised'),
  expect = chai.expect,
  should = chai.should();

chai.use(chaiAsPromised);

var snippetsFixtures = require('../fixtures/snippets');
var utilsPromises = require('../utils/promises');

describe('== Snippets ==', function() {

  describe('Snippets API', function() {
    it('exposes the expected methods', function() {
      expect(Snippets).to.have.property('__snippets');
      expect(Snippets).to.respondTo('resetItems');
      expect(Snippets).to.respondTo('validate');
      expect(Snippets).to.respondTo('getSnippets');
      expect(Snippets).to.respondTo('getById');
      expect(Snippets).to.respondTo('compile');
      expect(Snippets).to.respondTo('_compile');
      expect(Snippets).to.respondTo('register');
      expect(Snippets).to.respondTo('_register');
      expect(Snippets).to.respondTo('unregister');
      expect(Snippets).to.respondTo('_unregister');
    });
  });

  describe('Reset snippets', function() {
    beforeEach(function() {
      Snippets.__snippets = {
        'myDomain': {
          'snippetName': function() {}
        }
      };
    });

    after(function() {
      Snippets.__snippets = {};
    });

    it('Should be an empty object after calling it', function() {
      Snippets.resetItems();

      expect(Snippets.__snippets).to.be.a('object');
      expect(Object.keys(Snippets.__snippets).length).to.equals(0);
    });

  });


  describe('Snippets validation', function() {

    it('Validates a good snippet', function(done) {
      var goodSnippetModel = snippetsFixtures.correct[0];

      Snippets.validate(goodSnippetModel)
        .should.be.fulfilled
        .then(function(result) {
          expect(result).to.be.an('object');
          expect(result.valid).to.equals(true);
        })
        .should.notify(done);
    });

    it('Denies all the invalid models', function(done) {
      var promises = snippetsFixtures.malformed.map(function(snippet) {
        return Snippets.validate(snippet);
      });

      q.allSettled(promises)
        .then(function(results) {
          var allRejected = results.reduce(function(prev, next) {
            return prev && next.state === 'rejected';
          }, true);

          expect(allRejected).to.equals(true);
        })
        .should.notify(done);
    });

  });

  describe('Compile snippets', function() {
    var stubEvents;

    beforeEach(function() {
      stubEvents = sinon.stub();

      Snippets.events = {
        emit: stubEvents
      };

    });

    it('should compile a well formed snippet', function() {
      var snippet = snippetsFixtures.correct[0];
      var result = Snippets.compile(snippet);

      expect(result).to.be.a('object');
      expect(result).to.include.keys(
        'id',
        'code'
      );

      expect(result.id).to.be.a('string');
      expect(result.name).to.be.a('string');
      expect(result.name).to.equals('UserModel');
      expect(result.code).to.be.a('object');
      expect(result.code.fn).to.be.a('function');
    });

    it('should emit an event with information about the compilation', function() {
      var snippet = snippetsFixtures.correct[0];
      var result = Snippets.compile(snippet);

      //one from the evaluate code and one from the compilation
      expect(stubEvents.callCount).to.be.equals(2);
      expect(stubEvents.calledWith('debug', 'snippet:compiled')).to.equals(true);
    });

    it('should allow passing a single snippet', function() {
      var compiled = Snippets.compile(snippetsFixtures.correct[0]);
      expect(Array.isArray(compiled)).to.equals(false);
    });

    it('should allow passing multiple Snippets', function() {
      var compiledSnippets = Snippets.compile(snippetsFixtures.correct);
      expect(Array.isArray(compiledSnippets)).to.equals(true);
    });
  });

  describe('Get Snippets', function() {
    beforeEach(function() {
      Snippets.__snippets = {
        'testdomain': {
          'mySnippet1': {
            id: 'mySnippet1',
            code: {}
          },
          'mySnippet2': {
            id: 'mySnippet2',
            code: {}
          },
          'mySnippet3': {
            id: 'mySnippet3',
            code: {}
          },
        }
      };
    });

    afterEach(function() {
      Snippets.resetItems();
    });

    it('does not returns all the Snippets for all the domains if no domain is provided', function() {
      var candidates = Snippets.getSnippets();
      expect(candidates).to.equals(null);
    });

    it('returns all the Snippets for a single domain', function() {
      var candidates = Snippets.getSnippets('testdomain');
      expect(Object.keys(candidates).length).to.equals(3);
    });

  });


  describe('Get Snippets by id', function() {

    beforeEach(function() {
      Snippets.__snippets = {
        'testdomain': {
          'mySnippet1': {
            id: 'mySnippet1',
            code: {}
          },
          'mySnippet2': {
            id: 'mySnippet2',
            code: {}
          },
          'mySnippet3': {
            id: 'mySnippet3',
            code: {}
          },
        },
        'other:domain': {
          'mySnippet1': {
            id: 'mySnippet1-otherDomain',
            code: {}
          }
        }
      };
    });

    afterEach(function() {
      Snippets.resetItems();
    });

    it('should return null if no domain and no id is passed', function() {
      var snippet = Snippets.getById();
      expect(snippet).to.equals(null);
    });

    it('should return null if no id is passed', function() {
      var snippet = Snippets.getById('other:domain');
      expect(snippet).to.equals(null);
    });

    it('should not return the first matching snippet if no domain is passed', function() {
      var snippet = Snippets.getById('', 'mySnippet1');
      expect(snippet).to.be.an('null');
    });

    it('should return the correct matching snippet if a domain is passed', function() {
      var snippet = Snippets.getById('other:domain', 'mySnippet1');
      expect(snippet).to.be.an('object');
      expect(snippet.id).to.equals('mySnippet1-otherDomain');
    });

    it('should not return Snippets if the domain is wrong', function() {
      var snippet = Snippets.getById('my-domain-not-existing', 'mySnippet1');
      expect(snippet).to.be.a('null');
    });

    it('should not return any snippet if id is wrong', function() {
      var snippetObtained = Snippets.getById('other:domain', 'test-test-test');
      expect(snippetObtained).to.be.a('null');
    });

    //TODO: test to get after registration.

  });


  describe('Add to list', function() {

    afterEach(function() {
      Snippets.resetItems();
    });

    it('Adds a snippet with a domain', function() {
      var added = Snippets._addToList('addtolist:domain', {
        id: 'serious-snippet',
        name: 'UserModelSnippet',
        value: 'serious'
      });

      expect(Object.keys(Snippets.getSnippets('addtolist:domain')).length).to.equals(1);
      expect(Snippets.getById('addtolist:domain', 'UserModelSnippet')).to.be.an('object');
      expect(Snippets.getById('addtolist:domain', 'UserModelSnippet')).to.include.keys(
        'id',
        'name',
        'value'
      );
      expect(added).to.equals(true);
    });

    it('Does not add an empty snippet', function() {
      var added = Snippets._addToList('addtolist:domain', null);

      expect(Snippets.getSnippets('addtolist:domain')).to.be.a('null');
      expect(added).to.equals(false);
    });

    it('Does not add non objects', function() {
      var added = Snippets._addToList('addtolist:domain', 'Hey');

      expect(Snippets.getSnippets('addtolist:domain')).to.be.a('null');
      expect(added).to.equals(false);
    });

    it('Does not add a snippet without id', function() {
      var added = Snippets._addToList('addtolist:domain', {});

      expect(Snippets.getSnippets('addtolist:domain')).to.be.a('null');
      expect(added).to.equals(false);
    });

  });

  describe('Snippets Registration', function() {

    describe('Secure methods called', function() {
      var spyCompile, spyValidate, spy_compile, spyRegister, spyAddToList;

      beforeEach(function() {
        spyRegister = sinon.spy(Snippets, '_register');
        spyCompile = sinon.spy(Snippets, 'compile');
        spyValidate = sinon.spy(Snippets, 'validate');
        spy_compile = sinon.spy(Snippets, '_compile');
        spyAddToList = sinon.spy(Snippets, '_addToList');
      });

      afterEach(function() {
        spyRegister.restore();
        spyCompile.restore();
        spyValidate.restore();
        spy_compile.restore();
        spyAddToList.restore();
      });

      it('should call the compilation and validation methods when registering a snippet', function(done) {

        Snippets.register('test-domain', snippetsFixtures.correct[0])
          .should.be.fulfilled
          .then(function() {
            expect(spyCompile.callCount).to.equals(1);
            expect(spy_compile.callCount).to.equals(1);
            expect(spyValidate.callCount).to.equals(1);
          })
          .should.be.fulfilled.notify(done);
      });

      it('should call the _register method with the domain', function(done) {

        Snippets.register('test-domain', snippetsFixtures.correct[0])
          .should.be.fulfilled
          .then(function() {
            expect(spyRegister.callCount).to.equals(1);
            expect(spyRegister.calledWith('test-domain', snippetsFixtures.correct[0])).to.equals(true);
          })
          .should.be.fulfilled.notify(done);
      });

      it('should call the _addToList method with the domain', function(done) {

        Snippets.register('test-domain', snippetsFixtures.correct[0])
          .should.be.fulfilled
          .then(function() {
            expect(spyAddToList.callCount).to.equals(1);
            expect(spyAddToList.calledWith('test-domain')).to.equals(true);
          })
          .should.be.fulfilled.notify(done);
      });

    });

  });

});
/*
  

 

  describe('Snippets registration', function() {
    var stubEvents;
    var spyGenerateId;

    before(function() {
      spyGenerateId = sinon.spy(Snippets, '_generateId');
    });

    beforeEach(function() {
      stubEvents = sinon.stub();
      //Mock the composr external methods
      Snippets.events = {
        emit: stubEvents
      };

      //Reset Snippets for each test
      Snippets.resetSnippets();
    });

    after(function() {
      spyGenerateId.restore();
    });

    it('should allow to register an array of phrase models', function(done) {
      var Snippets = snippetsFixtures.correct;

      Snippets.register(Snippets)
        .should.be.fulfilled
        .then(function(result) {
          expect(result).to.be.an('array');
          expect(result.length).to.equals(1);
          expect(spyGenerateId.callCount).to.be.above(0);
        })
        .should.be.fulfilled.notify(done);
    });

    it('should allow to register a single phrase model', function(done) {
      var phrase = snippetsFixtures.correct[0];

      Snippets.register(phrase)
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

      Snippets.register(phrase, 'simpledomain')
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
      Snippets.register(snippetsFixtures.correct[0])
        .should.be.fulfilled
        .then(function() {
          expect(stubEvents.callCount).to.be.above(0);
          expect(stubEvents.calledWith('debug', 'phrase:registered')).to.equals(true);
        })
        .should.be.fulfilled.notify(done);
    });

    it('should return the registered state when it registers correctly', function(done) {
      var phrase = snippetsFixtures.correct[0];

      Snippets.register(phrase)
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
      var phrase = snippetsFixtures.malformed[0];

      Snippets.register(phrase)
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

    it('should warn when various Snippets matches the same regular expression', function(done) {
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

      Snippets.register(phrase)
        .should.be.fulfilled
        .then(function(result) {
          return Snippets.register(phrase);
        })
        .then(function(result) {
          expect(stubEvents.calledWith('warn', 'phrase:path:duplicated', phrase.url)).to.equals(true);
        })
        .should.notify(done);
    });

    it('should be returnable over the registered Snippets', function(done) {
      var phrase = snippetsFixtures.correct[0];
      var phraseId = phrase.id;

      Snippets.register(phrase, 'mydomain')
        .should.be.fulfilled
        .then(function(result) {
          expect(result.registered).to.equals(true);

          var candidates = Snippets.getSnippets('mydomain');

          expect(Object.keys(candidates).length).to.equals(1);

          var sureCandidate = Snippets.getById('mydomain', phraseId);

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

      Snippets.register(phraseToRegister, 'test-domain')
        .then(function(result) {
          expect(phraseToRegister.id).to.be.undefined;
          done();
        })
        .catch(done);
    });

    describe('Secure methods called', function() {
      var spyCompile, spyValidate, spy_compile, spyRegister, spyAddToList;

      beforeEach(function() {
        spyRegister = sinon.spy(Snippets, '_register');
        spyCompile = sinon.spy(Snippets, 'compile');
        spyValidate = sinon.spy(Snippets, 'validate');
        spy_compile = sinon.spy(Snippets, '_compile');
        spyAddToList = sinon.spy(Snippets, '_addToList');
      });

      afterEach(function() {
        spyRegister.restore();
        spyCompile.restore();
        spyValidate.restore();
        spy_compile.restore();
        spyAddToList.restore();
      });

      it('should call the compilation and validation methods when registering a phrase', function(done) {

        Snippets.register(snippetsFixtures.correct[0])
          .should.be.fulfilled
          .then(function() {
            expect(spyCompile.callCount).to.equals(1);
            expect(spy_compile.callCount).to.equals(1);
            expect(spyValidate.callCount).to.equals(1);
          })
          .should.be.fulfilled.notify(done);
      });

      it('should call the _register method with the domain', function(done) {

        Snippets.register(snippetsFixtures.correct[0], 'testingdomain:test')
          .should.be.fulfilled
          .then(function() {
            expect(spyRegister.callCount).to.equals(1);
            expect(spyRegister.calledWith(snippetsFixtures.correct[0], 'testingdomain:test')).to.equals(true);
          })
          .should.be.fulfilled.notify(done);
      });

      it('should call the _addToList method with the domain', function(done) {

        Snippets.register(snippetsFixtures.correct[0], 'testingdomain:test')
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
        Snippets.register(snippetsFixtures.malformed[0])
          .should.be.fulfilled
          .then(function() {
            expect(stubEvents.callCount).to.be.above(0);
            expect(stubEvents.calledWith('warn', 'phrase:not:registered')).to.equals(true);
          })
          .should.be.fulfilled.notify(done);
      });

      it('should return not registered when the registering fails because the validation fails', function(done) {
        Snippets.register(snippetsFixtures.malformed[0])
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
        stubCompile = sinon.stub(Snippets, 'compile', function() {
          return false;
        });
      });

      afterEach(function() {
        stubCompile.restore();
      });

      it('should emit an error when the registering fails because the compilation fails', function(done) {
        Snippets.register(snippetsFixtures.correct[0])
          .then(function() {
            expect(stubEvents.callCount).to.be.above(0);
            expect(stubEvents.calledWith('warn', 'phrase:not:registered')).to.equals(true);
            done();
          });
      });

      it('should return the unregistered state when the compilation fails', function(done) {
        Snippets.register(snippetsFixtures.correct[0])
          .should.be.fulfilled
          .then(function(result) {
            expect(result.registered).to.equals(false);
          })
          .should.notify(done);
      });
    });

    describe('Domain registration', function() {
      var existingPhraseId = snippetsFixtures.correct[0].id;

      beforeEach(function(done) {
        Snippets.register(snippetsFixtures.correct, 'mydomain')
          .then(function(res) {
            done();
          });
      });

      afterEach(function() {
        Snippets.resetSnippets();
      });

      it('should not return any phrase from other domain', function() {
        var phraseObtained = Snippets.getById('other:domain', existingPhraseId);

        expect(phraseObtained).to.be.a('null');
      });

      it('should return the phrase from my domain', function() {
        var phraseObtained = Snippets.getById('mydomain', existingPhraseId);

        expect(phraseObtained).to.include.keys(
          'url',
          'regexpReference',
          'codes',
          'id'
        );
      });
    });

  });

  xdescribe('Snippets unregistration', function() {
    beforeEach(function(done) {
      Snippets.register(snippetsFixtures.correct)
        .should.be.fulfilled.notify(done);
    });

    afterEach(function() {
      Snippets.resetSnippets();
    });

    it('should not remove an unregistered phrase', function() {
      Snippets.unregister(snippetsFixtures.correct[0].id)
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

  xdescribe('Snippets runner', function() {

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
        expect(Snippets._extractPhraseDomain(phrase)).to.equals(phrase.value);
      });
    });

  })


});*/