var Phrases = require('../../../src/lib/Phrases'),
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
  before(function() {
    Phrases.events = {
      emit: sinon.stub()
    };
  });

  describe('Get phrases by matching path', function() {
    var stubEvents;

    before(function(done) {
      var phrasesToRegister = [{
        url: 'test',
        get: {
          code: 'res.render(\'index\', {title: \'test\'});',
          doc: {}
        }
      }];

      Phrases.register(phrasesToRegister, 'mydomain')
        .should.be.fulfilled.should.notify(done);
    });

    beforeEach(function() {
      stubEvents = sinon.stub();
      //Mock the composr external methods
      Phrases.events = {
        emit: stubEvents
      };
    });

    after(function() {
      Phrases.resetPhrases();
    });

    it('returns the correct phrase for path "test"', function() {
      //var found = Phrases.getByMatchingPath('mydomain', 'test');
      //console.log(found);
    });

    it('returns the first matching phrase if no domain is provided', function() {

    });

    it('should return false if no phrase matches the path', function() {

    });

    it('should select the correct phrase from the correct domain if a domain is provided', function() {

    });

    it('should ignore query parameters', function() {

    });

    it('should emit an info event with the path that we are trying to match', function() {
      Phrases.getByMatchingPath('mydomain', 'test');
      expect(stubEvents.callCount).to.be.above(0);
      expect(stubEvents.calledWith('debug', 'phrase:getByMatchingPath:mydomain:test')).to.equals(true);
    });

    it('should emit an info event with the path that we are trying to match with null domain', function() {
      Phrases.getByMatchingPath('', 'test');
      expect(stubEvents.callCount).to.be.above(0);
      expect(stubEvents.calledWith('debug', 'phrase:getByMatchingPath:null:test')).to.equals(true);
    });

    it('should emit a warn event if no domain is provided, telling that it is matching against all', function() {
      var nullyCandidates = ['', null, undefined, 0, false];

      nullyCandidates.forEach(function(nullValue) {
        Phrases.getByMatchingPath(nullValue, 'test');
        expect(stubEvents.callCount).to.be.above(0);
        expect(stubEvents.calledWith('warn', 'phrase:getByMatchingPath:noDomain:matchingAgainstAll')).to.equals(true);
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

    });

    it('should emit an event of phrase not found if no phrase matches', function() {

    });

  });

  describe('for a set of paths', function() {

    it('returns the correct phrase each time', function() {

    });
  });

});