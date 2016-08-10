var PhraseManager = require('../../../src/lib/managers/Phrase'),
  SnippetsManager = require('../../../src/lib/managers/Snippet'),
  Requirer = require('../../../src/lib/requirer'),
  events = require('../../../src/lib/events'),
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
    name: 'modelSnippet',
    version : '1.2.2',
    codehash: new Buffer('exports({ iam: "A model"});').toString('base64')
  }];

  var phrasesToRegister = [{
    'url': 'user/:name',
    'version' : '1.2.2',
    'get': {
      'code': 'var name = req.params.name; res.send({ name: name });',
      'doc': {

      }
    }
  }, {
    'url': 'test',
    'version' : '1.2.2',
    'get': {
      'code': 'res.send("testValue");',
      'doc': {

      }
    }
  }, {
    'url': 'changestatus',
    'version' : '1.2.2',
    'get': {
      'code': 'res.send(401, "Allo allo");',
      'doc': {

      }
    }
  }, {
    'url': 'nextmiddleware',
    'version' : '1.2.2',
    'get': {
      'code': 'next();',
      'doc': {

      }
    }
  }, {
    'url': 'require',
    'version' : '1.2.2',
    'get': {
      'code': 'var model = require("snippet-modelSnippet"); res.send(model);',
      'doc': {

      }
    }
  }, {
    'url': 'usecorbeldriver/:value',
    'version' : '1.2.2',
    'get': {
      'code': 'corbelDriver.stubbed(req.params.value); res.send();',
      'doc': {

      }
    }
  }, {
    'url': 'timeout',
    'version' : '1.2.2',
    'get': {
      'code': 'var a = 3; while(true){ a = a + 3; };',
      'doc': {

      }
    }
  },{
    'url': 'timeoutfunction/:value',
    'version' : '1.2.5',
    'get': {
      'code': 'setTimeout(function(){ res.send(200); }, parseInt(req.params.value) * 3);',
      'doc': {

      }
    }
  }, {
    'url': 'queryparameters',
    'version' : '1.2.2',
    'get': {
      'code': 'res.send(req.query)',
      'doc': {

      }
    }
  }, {
    'url': 'queryparameters/:optional',
    'version' : '1.2.2',
    'get': {
      'code': 'res.send({ query : req.query, params : req.params })',
      'doc': {

      }
    }
  }, {
    'url': 'promise',
    'version' : '1.2.2',
    'get': {
      'code': 'var a = Promise.resolve(); a.then(function(){ res.send({hello: "world"}) });',
      'doc': {

      }
    }
  }, {
    'url': 'console',
    'version' : '1.2.2',
    'get': {
      'code': 'console.log("hey"); res.send();',
      'doc': {

      }
    }
  }, {
    'url': 'config',
    'version' : '1.2.2',
    'get': {
      'code': 'res.send(config)',
      'doc': {

      }
    }
  }, {
    'url': 'metrics',
    'version' : '1.2.2',
    'get': {
      'code': 'metrics.emit("Phrase executed"); res.send(200)',
      'doc': {

      }
    }
  }];

  beforeEach(function(done) {
    stubEvents = sinon.stub();

    Phrases = new PhraseManager({
      events: {
        emit: stubEvents
      },
      config: {
        urlBase: 'demo'
      }
    });

    spyRun = sinon.spy(Phrases, '_run');

    //New snippets instance
    var SnippetManager = new SnippetsManager({
      events: {
        emit: sinon.stub()
      }
    });

    Phrases.requirer = Requirer(SnippetManager);

    q.all([Phrases.register(domain, phrasesToRegister), SnippetManager.register(domain, snippetsToRegister)])
      .should.be.fulfilled.notify(done);

  });

  describe('Can be run', function() {
    it('only allows to run a phrase with the registered codes', function() {

      var phrase = Phrases.getById(domain + '!user!:name-1.2.2');

      var canBeRunnedWithGet = phrase.canRun('get');
      var canBeRunnedWithPost = phrase.canRun('post');
      var canBeRunnedWithPut = phrase.canRun('put');
      var canBeRunnedWithDelete = phrase.canRun('delete');

      expect(canBeRunnedWithGet).to.equals(true);
      expect(canBeRunnedWithPost).to.equals(false);
      expect(canBeRunnedWithPut).to.equals(false);
      expect(canBeRunnedWithDelete).to.equals(false);

    });
  });

  it('Should be able to run a registered phrase', function(done) {
    Phrases.runById(domain + '!test-1.2.2', null, null, function(err, response){
      expect(spyRun.callCount).to.equals(1);
      expect(response).to.be.an('object');
      expect(response).to.include.keys(
        'status',
        'body'
      );
      expect(response.body).to.equals('testValue');
      expect(response.status).to.equals(200);
      done(err);
    });
  });

  it('Should be able to receive a req object', function(done) {
    Phrases.runById(domain + '!user!:name-1.2.2', 'get', {
      req: {
        params: {
          name: 'Pepito the user'
        }
      }
    }, function(err, response){
        expect(spyRun.callCount).to.equals(1);
        expect(response).to.be.an('object');
        expect(response).to.include.keys(
          'status',
          'body'
        );
        expect(response.status).to.equals(200);
        expect(response.body).to.be.an('object');
        expect(response.body.name).to.exist;
        expect(response.body.name).to.equals('Pepito the user');
        done(err);
    });
  });

  it('Can change the status', function(done) {
    Phrases.runById(domain + '!changestatus-1.2.2', null, null, function(err, response){
      expect(spyRun.callCount).to.equals(1);
      expect(response).to.be.an('object');
      expect(response).to.include.keys(
        'status',
        'body'
      );
      expect(response.status).to.equals(401);

      done(err);
    });
  });

  it('receives a config object', function(done) {
    Phrases.runById(domain + '!config-1.2.2', null, null, function(err, response){
      expect(spyRun.callCount).to.equals(1);
      expect(response).to.be.an('object');
      expect(response.body).to.include.keys(
        'urlBase'
      );
      expect(response.status).to.equals(200);
      expect(response.body.urlBase).to.equals('demo');
      done(err);
    });
  });

  it('receives a config object, function mode', function(done) {
    Phrases.runById(domain + '!config-1.2.2', null, {
      functionMode: true
    }, function(err, response){
        expect(spyRun.callCount).to.equals(1);
        expect(response).to.be.an('object');
        expect(response.body).to.include.keys(
          'urlBase'
        );
        expect(response.status).to.equals(200);
        expect(response.body.urlBase).to.equals('demo');
        done(err)
    });
  });

  it.skip('Calls the metrics', function(done) {
    var stub = sinon.stub();
    events.on('metrics', 'TestsPhrasesRunner', stub);

    var result = Phrases.runById(domain + '!metrics-1.2.2');
    result
      .should.be.fulfilled
      .then(function(response) {
        expect(spyRun.callCount).to.equals(1);
        expect(stub.callCount).to.equals(1);
        expect(stub.calledWith({
          domain: domain,
          data: "Phrase executed"
        })).to.equals(true);
      })
      .should.notify(done);
  });

  describe('Path params', function() {

    it('Automatically extracts the path params with the runByPath', function(done) {
      Phrases.runByPath(domain, 'user/sanfrancisco', 'get', null, null, function(err, response){
        expect(spyRun.callCount).to.equals(1);
        expect(response).to.be.an('object');
        expect(response).to.include.keys(
          'status',
          'body'
        );
        expect(response.status).to.equals(200);
        expect(response.body).to.be.an('object');
        expect(response.body.name).to.exist;
        expect(response.body.name).to.equals('sanfrancisco');
        done(err);
      });
    });
    
    it('Prefers to use params if provided', function(done) {
      var reqParams = {
        name: 'sanmigueldeaquinohay'
      };

      Phrases.runByPath(domain, 'user/sanfrancisco', 'get', {
        params: reqParams
      }, null, function(err, response){
          expect(spyRun.callCount).to.equals(1);
          expect(response).to.be.an('object');
          expect(response).to.include.keys(
            'status',
            'body'
          );
          expect(response.status).to.equals(200);
          expect(response.body).to.be.an('object');
          expect(response.body.name).to.exist;
          expect(response.body.name).to.equals('sanmigueldeaquinohay');
          done(err);
      });
    });

  });

  describe('Query parameters', function() {

    it('Automatically extracts the query params with the runByPath', function(done) {
      Phrases.runByPath(domain, 'queryparameters?name=Pepito manolo&age=15&size=1000', 'get', null, null, function(err, response){
          expect(spyRun.callCount).to.equals(1);
          expect(response).to.be.an('object');
          expect(response).to.include.keys(
            'status',
            'body'
          );
          expect(response.status).to.equals(200);
          expect(response.body).to.be.an('object');
          expect(response.body.name).to.equals('Pepito manolo');
          expect(response.body.age).to.equals('15');
          expect(response.body.size).to.equals('1000');
          done(err);
      });
    });

    it('Prefers using reqQuery if provided', function(done) {
      var reqQuery = {
        name: 'santiago hernandez',
        age: '34',
        size: '1300'
      };
      
      Phrases.runByPath(domain, 'queryparameters?name=Pepito manolo&age=15&size=1000', 'get', {
        query: reqQuery
      }, null, function(err, response){
          expect(spyRun.callCount).to.equals(1);
          expect(response).to.be.an('object');
          expect(response).to.include.keys(
            'status',
            'body'
          );
          expect(response.status).to.equals(200);
          expect(response.body).to.be.an('object');
          expect(response.body.name).to.equals('santiago hernandez');
          expect(response.body.age).to.equals('34');
          expect(response.body.size).to.equals('1300');
          done(err)
      });
    });

    it('Can parse params and query parameters', function(done) {
      Phrases.runByPath(domain, 'queryparameters/safe?name=Pepito manolo&age=15&size=1000', 'get', null, null, 
        function(err, response){
          expect(spyRun.callCount).to.equals(1);
          expect(response).to.be.an('object');
          expect(response).to.include.keys(
            'status',
            'body'
          );

          expect(response.status).to.equals(200);
          expect(response.body).to.be.an('object');
          expect(response.body.query.name).to.equals('Pepito manolo');
          expect(response.body.query.age).to.equals('15');
          expect(response.body.query.size).to.equals('1000');
          expect(response.body.params.optional).to.equals('safe');
          done(err);
        });
    });

  });

  it('Executes correctly if the path has no params', function(done) {
    Phrases.runByPath(domain, 'test', 'get', null, null, function(err, response){
      expect(spyRun.callCount).to.equals(1);
      expect(response).to.be.an('object');
      expect(response).to.include.keys(
        'status',
        'body'
      );
      expect(response.status).to.equals(200);
      expect(response.body).to.equals('testValue');
      done(err);
    });
  });

  it('Executes correctly with Promise', function(done) {
    Phrases.runByPath(domain, 'promise', 'get', null, null, function(err, response){
      expect(spyRun.callCount).to.equals(1);
      expect(response).to.be.an('object');
      expect(response).to.include.keys(
        'status',
        'body'
      );
      expect(response.status).to.equals(200);
      expect(response.body).to.include.keys('hello');
      done(err);  
    });
  });

  it('Executes correctly with Console', function(done) {
    Phrases.runByPath(domain, 'console', 'get', null, null, function(err, response){
      expect(spyRun.callCount).to.equals(1);
      expect(response).to.be.an('object');
      expect(response).to.include.keys(
        'status',
        'body'
      );
      expect(response.status).to.equals(200);
      done(err);
    });
  });

  it('Should be able to receive a RESTIFY res object, return a 200', function(done) {
    var stubSend = sinon.stub();

    var res = {
      statusCode : 200,
      send: function(status, body){
        res.body = body;
        stubSend(status, body);
      },
      getHeaders: function(){},
      header: function(){}
    };

    Phrases.runByPath(domain, 'user/sanfrancisco', 'get', {
      res: res
    }, null, function(err, response){
      expect(stubSend.callCount).to.equals(1);
      expect(stubSend.calledWith(200, response.body)).to.equals(true);

      expect(response.status).to.equals(200);
      expect(response.body).to.exist;
      done(err);
    });
  });


  it('Should be able to receive a RESTIFY res object, return a 40X', function(done) {
    var stubSend = sinon.stub();

    var res = {
      statusCode : 200,
      send: function(status, body){
        res.statusCode = status;
        res.body = body;
        stubSend();
      },
      getHeaders: function(){},
      header: function(){}
    };

    var result = Phrases.runByPath(domain, 'changestatus', 'get', {
      res: res
    }, null, function(err, response){
      expect(stubSend.callCount).to.equals(1);

      expect(response.status).to.equals(401);
      expect(response.body).to.exist;
      done(err);
    });
  });

  it.skip('Should be able to receive a next object, and wrap it', function(done) {

    var next = sinon.stub();

    var result = Phrases.runByPath(domain, 'nextmiddleware', 'get', {
      next: next
    });

    expect(result).to.exist;

    result
      .should.be.fulfilled
      .then(function() {
        expect(next.callCount).to.equals(1);
      })
      .should.notify(done);
  });

  it('Should be able to receive a corbelDriver instance', function(done) {
    var mockCorbelDriver = {
      stubbed: sinon.stub()
    };

    Phrases.runByPath(domain, 'usecorbeldriver/testvalue', 'get', {
      corbelDriver: mockCorbelDriver
    }, null, function(err, response){
      expect(mockCorbelDriver.stubbed.callCount).to.equals(1);
      expect(mockCorbelDriver.stubbed.calledWith('testvalue')).to.equals(true);
      done(err);
    });
  });

  it('Should be able to require a snippet inside a phrase', function(done) {
    Phrases.runById(domain + '!require-1.2.2', null, null, function(err, response){
      expect(spyRun.callCount).to.equals(1);
      expect(response).to.be.an('object');
      expect(response).to.include.keys(
        'status',
        'body'
      );
      expect(response.status).to.equals(200);

      expect(response.body.iam).to.exist;
      expect(response.body.iam).to.equals('A model');
      done(err);
    });
  });

  it('should not allow to run an unregistered phrase', function(done) {
    Phrases.runById('nonexisting!id-1.2.2', null, null, function(err, response){
      expect(err).to.exist;
      expect(spyRun.callCount).to.equals(0);
      done();
    });
  });

  it('Should not allow to run an unregistered VERB', function(done) {
    Phrases.runById(domain + ':user!:name-1.2.2', 'post', null, function(err, response){
      expect(err).to.exist;
      expect(spyRun.callCount).to.equals(0);
      done();
    });
  });

  describe('timeout phrases', function() {
    //@TODO: add the timeout handler for function mode
    this.timeout(3000);

    it('cuts the phrase execution at 500 ms', function(done) {
      Phrases.runByPath(domain, 'timeout', 'get', {
        timeout: 500,
        functionMode: false
      }, null, function(err, response){
          expect(spyRun.callCount).to.equals(1);
          expect(response.status).to.equals(503);
          expect(stubEvents.calledWith('warn', 'phrase:timedout')).to.equals(true);
          done(err);
      });
    });

    it('cuts the phrase execution at 500 ms with function mode', function(done) {
      Phrases.runByPath(domain, 'timeoutfunction/500', 'get', {
        timeout: 500,
        functionMode: true
      }, null, function(err, response){
        expect(spyRun.callCount).to.equals(1);
        expect(response.status).to.equals(503);
        done(err);
      });
    });
  });

  describe('Function and Script mode', function() {
    var spyScript, spyFunction;

    beforeEach(function() {
      var phrase = Phrases.getById(domain + '!changestatus-1.2.2');
      spyScript = sinon.spy(phrase, '__executeScriptMode');
      spyFunction = sinon.spy(phrase, '__executeFunctionMode');
    });

    afterEach(function() {
      spyScript.reset();
      spyFunction.reset();
    });

    it('Can be invoked with the script option', function(done) {
      Phrases.runById(domain + '!changestatus-1.2.2', null, {
        functionMode: false
      }, function(err, response){
        expect(spyFunction.callCount).to.equals(0);
        expect(spyScript.callCount).to.equals(1);
        expect(response.status).to.equals(401);
        done(err);
      });
    });

    it('Runs by default with function mode', function(done) {
      Phrases.runById(domain + '!changestatus-1.2.2', null, null, function(err, response){
        expect(spyFunction.callCount).to.equals(1);
        expect(spyScript.callCount).to.equals(0);
        expect(response.status).to.equals(401);
        done(err);
      });
    });
  });
});
