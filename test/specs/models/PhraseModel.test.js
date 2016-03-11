var PhraseModel = require('../../../src/lib/models/PhraseModel'),
  chai = require('chai'),
  sinon = require('sinon'),
  expect = chai.expect;

var phrasesFixtures = require('../../fixtures/phrases');

describe('Phrase Model', function() {
  it('Has all the methods needed', function(){
    expect(PhraseModel.prototype).to.respondTo('_generateId');
    expect(PhraseModel.prototype).to.respondTo('getId');
    expect(PhraseModel.prototype).to.respondTo('getMD5');
    expect(PhraseModel.prototype).to.respondTo('getVirtualDomainId');
    expect(PhraseModel.prototype).to.respondTo('getUrl');
    expect(PhraseModel.prototype).to.respondTo('getVersion');
    expect(PhraseModel.prototype).to.respondTo('getRegexp');
    expect(PhraseModel.prototype).to.respondTo('getRegexpReference');
    expect(PhraseModel.prototype).to.respondTo('getRawModel');
    expect(PhraseModel.prototype).to.respondTo('canRun');
    expect(PhraseModel.prototype).to.respondTo('matchesPath');
    expect(PhraseModel.prototype).to.respondTo('extractParamsFromPath');
    expect(PhraseModel.prototype).to.respondTo('compile');
    expect(PhraseModel.prototype).to.respondTo('__executeScriptMode');
    expect(PhraseModel.prototype).to.respondTo('__executeFunctionMode');
  });
  //TODO: test all the methods
  //
  describe('Initialization', function(){
    
    it('Generates the correct ids for each phrase url', function() {
      var examplePhrases = [{
        url: 'test',
        domain: 'mydomain',
        version : '2.2.2',
        expected: 'mydomain!test-2.2.2'
      }, {
        url: 'test/:user',
        domain: 'mydomain',
        version : '0.2.2',
        expected: 'mydomain!test!:user-0.2.2'
      }, {
        url: 'test/:path/:path/:path/:path?/user',
        domain: 'anotherdomain',
        version : '2.3.2',
        expected: 'anotherdomain!test!:path!:path!:path!:path?!user-2.3.2'
      }];

      examplePhrases.forEach(function(value) {
        var myNewModel = new PhraseModel(value, value.domain);
        expect(myNewModel.getId()).to.equals(value.expected);
      });
    });

    it('Generates the regexpreference for each phrase', function(){
      var phrase = {
        url : 'user/me/:param'
      };

      var model = new PhraseModel(phrase, 'test:domain');

      expect(model.getRegexpReference).not.to.equals(null);
      expect(model.regexpReference).to.be.an('object');
      expect(model.regexpReference).to.include.keys(
        'params',
        'regexp'
      );
    });

    it('should extract the pathparams for the url', function() {
      var phrase = {
        url: 'test/:param/:optional?',
        get: {
          code: 'console.log(3);'
        }
      };

      var model = new PhraseModel(phrase, 'test:domain');

      expect(model.getRegexpReference()).to.be.defined;
      expect(model.getRegexpReference().params.length).to.equals(2);
      expect(model.getRegexpReference().params[0]).to.equals('param');
      expect(model.getRegexpReference().params[1]).to.equals('optional?');
    });

  });

  describe('Compilation', function(){

    it('should compile a well formed phrase', function() {
      var phrase = new PhraseModel(phrasesFixtures.correct[0], 'test:domain');
      
      phrase.compile({
        emit: sinon.stub()
      });

      expect(phrase.compiled).to.include.keys(
        'codes'
      );

      expect(phrase.compiled.codes).to.be.an('object');
      
      expect(Object.keys(phrase.compiled.codes).length).to.be.above(0);

    });

    it('should compile a phrase with code instead of codehash', function() {
      var phrase = {
        url: 'thephrase/without/:id',
        get: {
          code: 'console.log(a);',
          doc: {}
        }
      };

      var model = new PhraseModel(phrase, 'test:domain');

      model.compile({
        emit: sinon.stub()
      });

      expect(model.compiled.codes.get.fn).to.be.a('function');
    });

    it('launches an event with the evaluation', function() {
      var phrase = {
        url: 'thephrase/without/:id',
        version : '2.3.4',
        get: {
          code: 'console.log(a);',
          doc: {}
        }
      };

      var model = new PhraseModel(phrase, 'test:domain');
      var stubEvents = sinon.stub();

      model.compile({
        emit: stubEvents
      });

      expect(stubEvents.callCount).to.equals(2);
      expect(stubEvents.calledWith('debug', 'test:domain!thephrase!without!:id-2.3.4:evaluatecode:good')).to.equals(true);
    });

    it('launches a warn event with a wrong code', function() {
      var phrase = {
        url: 'thephrase/without/:id',
        version : '2.3.4',
        get: {
          code: '}',
          doc: {}
        }
      };

      var model = new PhraseModel(phrase, 'test:domain');
      var stubEvents = sinon.stub();

      model.compile({
        emit: stubEvents
      });

      expect(stubEvents.callCount).to.equals(2);
      expect(stubEvents.calledWith('warn', 'test:domain!thephrase!without!:id-2.3.4:evaluatecode:wrong_code')).to.equals(true);
    });

  });
});