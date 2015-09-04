var PhraseManager = require('../../../src/lib/Phrases'),
  _ = require('lodash'),
  chai = require('chai'),
  sinon = require('sinon'),
  chaiAsPromised = require('chai-as-promised'),
  expect = chai.expect,
  should = chai.should();

chai.use(chaiAsPromised);

var phrasesFixtures = require('../../fixtures/phrases');
var utilsPromises = require('../../utils/promises');

describe('Phrases -> getByMatchingPath', function() {
  var stubEvents, Phrases;

  beforeEach(function() {
    stubEvents = sinon.stub();

    Phrases = new PhraseManager({
      events: {
        emit: stubEvents
      }
    });
  });

  describe('Get phrases by matching path', function() {

    beforeEach(function(done) {
      var phrasesToRegister = [{
        url: 'test',
        get: {
          code: 'res.render(\'index\', {title: \'test\'});',
          doc: {}
        }
      }, {
        url: 'user/:id',
        put: {
          code: 'res.render(\'index\', {title: \'test\'});',
          doc: {}
        },
        get: {
          code: 'res.render(\'index\', {title: \'test\'});',
          doc: {}
        }
      }, {
        url: 'user/one',
        post: {
          code: 'res.render(\'index\', {title: \'test\'});',
          doc: {}
        },
        get: {
          code: 'res.render(\'index\', {title: \'test\'});',
          doc: {}
        }
      }];

      Phrases.register('mydomain', phrasesToRegister)
        .then(function() {
          return Phrases.register('other-domain', phrasesToRegister);
        })
        .should.be.fulfilled.should.notify(done);
    });

    it('should return null if no phrase matches the path', function() {
      var found = Phrases.getByMatchingPath('mydomain', 'asdasd', 'get');
      expect(found).to.equals(null);
    });

    it('should return null if the verb does not match', function() {
      var found = Phrases.getByMatchingPath('mydomain', 'test', 'delete');
      expect(found).to.equals(null);
    });

    it('returns the correct phrase for path "test"', function() {
      var found = Phrases.getByMatchingPath('mydomain', 'test');
      expect(found.url).to.equals('test');
      expect(found.id).to.equals('mydomain!test');
      expect(found).to.include.keys(
        'id',
        'url',
        'regexpReference',
        'codes'
      );
    });

    it('returns the correct phrase for path "user/one" and verb put', function() {
      var found = Phrases.getByMatchingPath('mydomain', 'user/one', 'put');
      expect(found.url).to.equals('user/:id');
      expect(found.id).to.equals('mydomain!user!:id');
      expect(found).to.include.keys(
        'id',
        'url',
        'regexpReference',
        'codes'
      );
    });

    it('returns the first phrase for path "user/one", that matches two phrases', function() {
      var found = Phrases.getByMatchingPath('mydomain', 'user/one', 'get');
      expect(found.url).to.equals('user/:id');
      expect(found.id).to.equals('mydomain!user!:id');
      expect(found).to.include.keys(
        'id',
        'url',
        'regexpReference',
        'codes'
      );
    });

    it('returns the correct phrase for the mathcing verb', function() {
      var found = Phrases.getByMatchingPath('mydomain', 'user/one', 'post');
      expect(found.url).to.equals('user/one');
      expect(found.id).to.equals('mydomain!user!one');
      expect(found).to.include.keys(
        'id',
        'url',
        'regexpReference',
        'codes'
      );
    });

    it('returns the first matching phrase if no domain is provided', function() {
      var found = Phrases.getByMatchingPath('', 'user/one', 'get');
      expect(found.url).to.equals('user/:id');
      expect(found.id).to.equals('mydomain!user!:id');
      expect(found).to.include.keys(
        'id',
        'url',
        'regexpReference',
        'codes'
      );
    });

    it('should select the correct phrase from the correct domain if a domain is provided', function() {
      var found = Phrases.getByMatchingPath('other-domain', 'user/one', 'get');
      expect(found.url).to.equals('user/:id');
      expect(found.id).to.equals('other-domain!user!:id');
    });

    it('should ignore query parameters', function() {
      var found = Phrases.getByMatchingPath('other-domain', 'user/one?query={$eq:{name:"hola"}}', 'get');
      expect(found.url).to.equals('user/:id');
      expect(found.id).to.equals('other-domain!user!:id');
    });

    /**** EVENTS *****/

    it('should emit an debug event with the path that we are trying to match', function() {
      Phrases.getByMatchingPath('mydomain', 'test');
      expect(stubEvents.callCount).to.be.above(0);
      expect(stubEvents.calledWith('debug', 'phrase:getByMatchingPath:mydomain:test:get')).to.equals(true);
    });

    it('should emit an debug event with the correct verb that we are trying to match', function() {
      Phrases.getByMatchingPath('mydomain', 'test', 'put');
      expect(stubEvents.callCount).to.be.above(0);
      expect(stubEvents.calledWith('debug', 'phrase:getByMatchingPath:mydomain:test:put')).to.equals(true);
    });

    it('should emit an info event with the path that we are trying to match with null domain', function() {
      Phrases.getByMatchingPath('', 'test');
      expect(stubEvents.callCount).to.be.above(0);
      expect(stubEvents.calledWith('debug', 'phrase:getByMatchingPath:null:test:get')).to.equals(true);
    });

    it('should emit a warn event if no domain is provided, telling that it is matching against all', function() {
      var nullyCandidates = ['', null, undefined, 0, false];

      nullyCandidates.forEach(function(nullValue) {
        Phrases.getByMatchingPath(nullValue, 'test');
        expect(stubEvents.callCount).to.be.above(0);
        expect(stubEvents.calledWith('warn', 'phrase:getByMatchingPath:noDomain:matchingAgainstAll:expensiveMethod')).to.equals(true);
        //Reset the callcount on each call
        stubEvents.reset();
      });
    });

    it('returns null and emits an error event if no path is provided', function() {
      var nullyCandidates = ['', null, undefined, 0, false];

      nullyCandidates.forEach(function(nullValue) {
        var result = Phrases.getByMatchingPath('', nullValue);
        expect(result).to.equals(null);
        expect(stubEvents.callCount).to.be.above(0);
        expect(stubEvents.calledWith('error', 'phrase:getByMatchingPath:path:undefined')).to.equals(true);
        //Reset the callcount on each call
        stubEvents.reset();
      });

    });

    it('should emit an event of phrase found if a phrase matches', function() {
      Phrases.getByMatchingPath('', 'test');
      expect(stubEvents.callCount).to.be.above(0);
      expect(stubEvents.calledWith('debug', 'found:2:candidates')).to.equals(true);
      expect(stubEvents.calledWith('debug', 'using:candidate:mydomain!test:get')).to.equals(true);
    });

    it('should emit an event of phrase with 1 candidate if there is only 1 candidate matching', function() {
      Phrases.getByMatchingPath('other-domain', 'test');
      expect(stubEvents.callCount).to.be.above(0);
      expect(stubEvents.calledWith('debug', 'found:1:candidates')).to.equals(true);
      expect(stubEvents.calledWith('debug', 'using:candidate:other-domain!test:get')).to.equals(true);
    });

    it('should emit an event of phrase not found if no phrase matches', function() {
      Phrases.getByMatchingPath('', 'unexisting', 'post');
      expect(stubEvents.callCount).to.be.above(0);
      expect(stubEvents.calledWith('debug', 'found:0:candidates')).to.equals(true);
      expect(stubEvents.calledWith('debug', 'notfound:candidates:path:unexisting:post')).to.equals(true);
    });

  });

  describe('for a set of paths', function() {

    var testValues = [{
      path: 'test',
      verbs: ['get', 'post'],
      test: ['test', '/test', '/test?query="a"', '/test/'],
      testfail: ['tost', 'test/12']
    }, {
      path: 'user/:id',
      verbs: ['get', 'delete', 'post', 'put'],
      test: ['user/asd', '/user/id', '/user/asda?query="a"'],
      testfail: ['/user', '/user/', '/user/sads/asdsad']
    }];

    before(function(done) {
      var phrasesToRegister = [];

      //Consctruct all the phrases
      testValues.forEach(function(testValue) {
        var phrase = {
          url: testValue.path,
        };

        testValue.verbs.forEach(function(verb) {
          phrase[verb] = {
            code: 'res.render(\'index\', {title: \'test\'});',
            doc: {}
          };
        });

        phrasesToRegister.push(phrase);
      });

      Phrases.register('test-domain', phrasesToRegister)
        .should.be.fulfilled.should.notify(done);
    });

    after(function() {
      Phrases.resetItems();
    });

    it('returns the correct phrase each time', function() {

      testValues.forEach(function(testValue) {
        testValue.verbs.forEach(function(verb) {
          testValue.test.forEach(function(path) {
            var found = Phrases.getByMatchingPath('test-domain', path, verb);
            expect(found).not.to.equals(null);
            expect(found.url).to.equals(testValue.path);
          });
        });
      });

    });

    it('should not return any phrase for the failing paths', function() {

      testValues.forEach(function(testValue) {
        testValue.verbs.forEach(function(verb) {
          testValue.testfail.forEach(function(path) {
            var found = Phrases.getByMatchingPath('test-domain', path, verb);
            expect(found).to.equals(null);
          });
        });
      });

    });

  });

});