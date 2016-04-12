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
        version: '2.2.2',
        expected: 'mydomain!test-2.2.2'
      }, {
        url: 'test/:user',
        domain: 'mydomain',
        version: '0.2.2',
        expected: 'mydomain!test!:user-0.2.2'
      }, {
        url: 'test/:path/:path2/:path3/:path4?/user',
        domain: 'anotherdomain',
        version: '2.3.2',
        expected: 'anotherdomain!test!:path!:path2!:path3!:path4?!user-2.3.2'
      }];

      examplePhrases.forEach(function(value) {
        var myNewModel = new PhraseModel(value, value.domain);
        expect(myNewModel.getId()).to.equals(value.expected);
      });
    });

    it('Generates the regexpreference for each phrase', function(){
      var phrase = {
        url: 'user/me/:param'
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
        version: '2.3.4',
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
        version: '2.3.4',
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

  describe('Can run', function(){
    it('Returns true for GET', function(){
      var model = new PhraseModel({
        url: 'a/b',
        version: '2.2.3',
        get: {
          code: 'console.log(3);'
        }
      }, 'domain');

      model.compile();

      expect(model.canRun('get')).to.equals(true);
      expect(model.canRun('post')).to.equals(false);
      expect(model.canRun('put')).to.equals(false);
      expect(model.canRun('delete')).to.equals(false);
    });

    it('Returns true for PUT AND POST', function(){
      var model = new PhraseModel({
        url: 'a/b',
        version: '2.2.3',
        put: {
          code: 'console.log(3);'
        },
        post: {
          code: 'console.log(3);'
        }
      }, 'domain');

      model.compile();

      expect(model.canRun('get')).to.equals(false);
      expect(model.canRun('post')).to.equals(true);
      expect(model.canRun('put')).to.equals(true);
      expect(model.canRun('delete')).to.equals(false);
    });

    it('Returns true for DELETE', function(){
      var model = new PhraseModel({
        url: 'a/b',
        version: '2.2.3',
        delete: {
          code: 'console.log(3);'
        }
      }, 'domain');

      model.compile();

      expect(model.canRun('get')).to.equals(false);
      expect(model.canRun('post')).to.equals(false);
      expect(model.canRun('put')).to.equals(false);
      expect(model.canRun('delete')).to.equals(true);
    });
  });

  describe('Get middlewares', function(){
    var model = new PhraseModel({
      url: 'a/b',
      version: '2.2.3',
      delete: {
        code: 'console.log(3);'
      },
      get: {
        code: 'console.log(1)',
        middlewares: ['mock', 'validate']
      },
      post: {
        code: 'console.log(1)',
        middlewares: ['validate']
      }
    }, 'domain');

    it('Returns an empty array if its not defined', function(){
      expect(model.getMiddlewares('delete').length).to.equals(0);
      expect(model.getMiddlewares('delete')).to.be.a('array');
    });

    it('Returns the correct middlewars for get', function(){
      expect(model.getMiddlewares('get').length).to.equals(2);
      expect(model.getMiddlewares('get')).to.be.a('array');
    });

    it('Returns the correct middlewars for post', function(){
      expect(model.getMiddlewares('post').length).to.equals(1);
      expect(model.getMiddlewares('post')).to.be.a('array');
    });

    it('Returns an empty array if no verb is passed', function(){
      expect(model.getMiddlewares('').length).to.equals(0);
      expect(model.getMiddlewares('')).to.be.a('array');
    });
  });

  describe('Get Doc', function(){
    var model = new PhraseModel({
        url: 'a/b',
        version: '2.2.3',
        delete: {
          code: 'console.log(3);',
          doc: 'delete Doc'
        },
        get: {
          code: 'console.log(1)',
          doc: 'get Doc'
        },
        post: {
          code: 'console.log(1)',
          doc: 'post Doc'
        },
        put: {
          code: 'console.log(1)'
        }
      }, 'domain');

    it('Returns null if its not defined', function(){
      expect(model.getDoc('put')).to.be.a('null');
    });

    it('Returns the correct middlewars for get', function(){
      expect(model.getDoc('get')).to.equals('get Doc');
    });

    it('Returns the correct middlewars for post', function(){
      expect(model.getDoc('post')).to.equals('post Doc');
    });

    it('Returns null if no verb is passed', function(){
      expect(model.getDoc('')).to.be.a('null');
    });
  });

});