var PhraseManager = require('../../../src/lib/Phrases'),
  SnippetsManager = require('../../../src/lib/Snippets'),
  Requirer = require('../../../src/lib/requirer'),
  _ = require('lodash'),
  chai = require('chai'),
  sinon = require('sinon'),
  q = require('q'),
  chaiAsPromised = require('chai-as-promised'),
  expect = chai.expect,
  should = chai.should();

chai.use(chaiAsPromised);

describe('Phrases runner', function() {
  var domain = 'bq:domain';
  var spyRun;
  var stubEvents, Phrases;

  var snippetsToRegister = [{
    id: domain + '!modelSnippet',
    codehash: new Buffer('exports({ iam: "A model"});').toString('base64')
  }];

  var phrasesToRegister = [{
    'url': 'user/:name',
    'get': {
      'code': 'var name = req.params.name; res.send({ username: name });',
      'doc': {

      }
    }
  }, {
    'url': 'test',
    'get': {
      'code': 'res.send("testValue");',
      'doc': {

      }
    }
  }, {
    'url': 'changestatus',
    'get': {
      'code': 'res.status(401).send("Allo allo");',
      'doc': {

      }
    }
  }, {
    'url': 'require',
    'get': {
      'code': 'var model = require("snippet-modelSnippet"); res.send(model);',
      'doc': {

      }
    }
  }];

  beforeEach(function(done) {
    stubEvents = sinon.stub();

    Phrases = new PhraseManager({
      events: {
        emit: stubEvents
      }
    });

    spyRun = sinon.spy(Phrases, '_run');

    //New snippets instance
    var Snippets = new SnippetsManager({
      events: {
        emit: sinon.stub()
      }
    });

    Phrases.requirer = new Requirer({
      events: {
        emit: sinon.stub()
      },
      Snippets: Snippets
    });

    q.all([Phrases.register(domain, phrasesToRegister), Snippets.register(domain, snippetsToRegister)])
      .should.be.fulfilled.notify(done);

  });

  describe('Can be run', function() {
    it('only allows to run a phrase with the registered codes', function() {

      var phrase = Phrases.getById(domain, domain + '!user!:name');

      var canBeRunnedWithGet = Phrases.canBeRun(phrase, 'get');
      var canBeRunnedWithPost = Phrases.canBeRun(phrase, 'post');
      var canBeRunnedWithPut = Phrases.canBeRun(phrase, 'put');
      var canBeRunnedWithDelete = Phrases.canBeRun(phrase, 'delete');

      expect(canBeRunnedWithGet).to.equals(true);
      expect(canBeRunnedWithPost).to.equals(false);
      expect(canBeRunnedWithPut).to.equals(false);
      expect(canBeRunnedWithDelete).to.equals(false);

    });
  });

  it('Should be able to run a registered phrase', function(done) {
    var result = Phrases.runById(domain, domain + '!test');

    expect(result).to.exist;

    result
      .should.be.fulfilled
      .then(function(response) {
        expect(spyRun.callCount).to.equals(1);
        expect(response).to.be.an('object');
        expect(response).to.include.keys(
          'status',
          'body'
        );
        expect(response.body).to.equals('testValue');
        expect(response.status).to.equals(200);
      })
      .should.notify(done);
  });

  it('Should be able to receive a req object', function(done) {
    var result = Phrases.runById(domain, domain + '!user!:name', 'get', {
      req: {
        params: {
          name: 'Pepito the user'
        }
      }
    });

    expect(result).to.exist;

    result
      .should.be.fulfilled
      .then(function(response) {
        expect(spyRun.callCount).to.equals(1);
        expect(response).to.be.an('object');
        expect(response).to.include.keys(
          'status',
          'body'
        );
        expect(response.status).to.equals(200);
        expect(response.body).to.be.an('object');
        expect(response.body.username).to.exist;
        expect(response.body.username).to.equals('Pepito the user');
      })
      .should.notify(done);
  });

  it('Can change the status', function(done) {
    var result = Phrases.runById(domain, domain + '!changestatus');
    result
      .should.be.rejected
      .then(function(response) {
        expect(spyRun.callCount).to.equals(1);
        expect(response).to.be.an('object');
        expect(response).to.include.keys(
          'status',
          'body'
        );
        expect(response.status).to.equals(401);
      })
      .should.notify(done);
  });

  it('Automatically extracts the path params with the runByPath', function(done) {
    var result = Phrases.runByPath(domain, 'user/sanfrancisco', 'get');

    expect(result).to.exist;

    result
      .should.be.fulfilled
      .then(function(response) {
        expect(spyRun.callCount).to.equals(1);
        expect(response).to.be.an('object');
        expect(response).to.include.keys(
          'status',
          'body'
        );
        expect(response.status).to.equals(200);
        expect(response.body).to.be.an('object');
        expect(response.body.username).to.exist;
        expect(response.body.username).to.equals('sanfrancisco');
      })
      .should.notify(done);
  });

  it('Executes correctly if the path has no params', function(done) {
    var result = Phrases.runByPath(domain, 'test', 'get');

    expect(result).to.exist;

    result
      .should.be.fulfilled
      .then(function(response) {
        expect(spyRun.callCount).to.equals(1);
        expect(response).to.be.an('object');
        expect(response).to.include.keys(
          'status',
          'body'
        );
        expect(response.status).to.equals(200);
        expect(response.body).to.equals('testValue');
      })
      .should.notify(done);
  });

  it.skip('Should be able to receive a res object, and wrap it', function() {

  });

  it.skip('Should be able to receive a next object, and wrap it', function() {

  });

  it.skip('Should be able to receive a corbelDriver instance', function() {

  });

  it.skip('Should execute the phrase with a domain', function() {

  });

  it.skip('Should receive a requirer object', function() {

  });

  it.skip('Should be able to require a snippet inside a phrase', function(done) {
    var result = Phrases.runById(domain, domain + '!require');
    result
      .should.be.fulfilled
      .then(function(response) {
        console.log(response);
        expect(spyRun.callCount).to.equals(1);
        expect(response).to.be.an('object');
        expect(response).to.include.keys(
          'status',
          'body'
        );
        expect(response.status).to.equals(200);

      })
      .should.notify(done);
  });

  it('should not allow to run an unregistered phrase', function(done) {
    var result = Phrases.runById(domain, 'nonexisting!id');

    result
      .should.be.rejected
      .then(function() {
        expect(spyRun.callCount).to.equals(0);
      })
      .should.notify(done);
  });

  it('Should not allow to run an unregistered VERB', function(done) {
    var result = Phrases.runById(domain, domain + ':user!:name', 'post');

    result
      .should.be.rejected
      .then(function() {
        expect(spyRun.callCount).to.equals(0);
      })
      .should.notify(done);
  });

});