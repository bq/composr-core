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
    var result = Phrases.runById(domain + '!test-1.2.2');

    expect(result).to.exist;

    result
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
    var result = Phrases.runById(domain + '!user!:name-1.2.2', 'get', {
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
        expect(response.body.name).to.exist;
        expect(response.body.name).to.equals('Pepito the user');
      })
      .should.notify(done);
  });

  it('Can change the status', function(done) {
    var result = Phrases.runById(domain + '!changestatus-1.2.2');
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

  it('receives a config object', function(done) {
    var result = Phrases.runById(domain + '!config-1.2.2');
    result
      .should.be.fulfilled
      .then(function(response) {
        expect(spyRun.callCount).to.equals(1);
        expect(response).to.be.an('object');
        expect(response.body).to.include.keys(
          'urlBase'
        );
        expect(response.status).to.equals(200);
        expect(response.body.urlBase).to.equals('demo');
      })
      .should.notify(done);
  });

  it('receives a config object, function mode', function(done) {
    var result = Phrases.runById(domain + '!config-1.2.2', null, {
      functionMode: true
    });

    result
      .should.be.fulfilled
      .then(function(response) {
        expect(spyRun.callCount).to.equals(1);
        expect(response).to.be.an('object');
        expect(response.body).to.include.keys(
          'urlBase'
        );
        expect(response.status).to.equals(200);
        expect(response.body.urlBase).to.equals('demo');
      })
      .should.notify(done);
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
          expect(response.body.name).to.exist;
          expect(response.body.name).to.equals('sanfrancisco');
        })
        .should.notify(done);
    });

    it('Automatically extracts the path params with spaces and tilde', function(done) {
      var result = Phrases.runByPath(domain, 'user/Grupo Planeta - México', 'get');

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
          expect(response.body.name).to.exist;
          expect(response.body.name).to.equals('Grupo Planeta - México');
        })
        .should.notify(done);
    });
    
    it('Prefers to use params if provided', function(done) {
      var reqParams = {
        name: 'sanmigueldeaquinohay'
      };

      var result = Phrases.runByPath(domain, 'user/sanfrancisco', 'get', {
        params: reqParams
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
          expect(response.body.name).to.exist;
          expect(response.body.name).to.equals('sanmigueldeaquinohay');
        })
        .should.notify(done);
    });

  });

  describe('Query parameters', function() {

    it('Automatically extracts the query params with the runByPath', function(done) {
      var result = Phrases.runByPath(domain, 'queryparameters?name=Pepito manolo&age=15&size=1000', 'get');

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
          expect(response.body.name).to.equals('Pepito manolo');
          expect(response.body.age).to.equals('15');
          expect(response.body.size).to.equals('1000');
        })
        .should.notify(done);
    });

    it('Prefers using reqQuery if provided', function(done) {
      var reqQuery = {
        name: 'santiago hernandez',
        age: '34',
        size: '1300'
      };
      var result = Phrases.runByPath(domain, 'queryparameters?name=Pepito manolo&age=15&size=1000', 'get', {
        query: reqQuery
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
          expect(response.body.name).to.equals('santiago hernandez');
          expect(response.body.age).to.equals('34');
          expect(response.body.size).to.equals('1300');
        })
        .should.notify(done);
    });

    it('Can parse params and query parameters', function(done) {
      var result = Phrases.runByPath(domain, 'queryparameters/safe?name=Pepito manolo&age=15&size=1000', 'get');

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

          console.log(JSON.stringify(response.body), null, 2);
          expect(response.status).to.equals(200);
          expect(response.body).to.be.an('object');
          expect(response.body.query.name).to.equals('Pepito manolo');
          expect(response.body.query.age).to.equals('15');
          expect(response.body.query.size).to.equals('1000');
          expect(response.body.params.optional).to.equals('safe');
        })
        .should.notify(done);
    });

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

  it('Executes correctly with Promise', function(done) {
    var result = Phrases.runByPath(domain, 'promise', 'get');

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
        expect(response.body).to.include.keys('hello');
      })
      .should.notify(done);
  });

  it('Executes correctly with Console', function(done) {
    var result = Phrases.runByPath(domain, 'console', 'get');

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
      })
     .should.notify(done);
  });

  it('Should be able to receive a RESTIFY res object, wrap it on a RESOLVED promise', function(done) {
    var callback

    var stubSend = sinon.stub();

    var res = {
      statusCode : 200,
      send: function(body){
        res.body = body;
        callback();
        stubSend(body);
      },
      on: function(e, cb){
        callback = cb
      },
      getHeaders: function(){}
    };

    var result = Phrases.runByPath(domain, 'user/sanfrancisco', 'get', {
      res: res,
      server: 'restify'
    });

    expect(result).to.exist;

    result
      .then(function(response) {
        expect(stubSend.callCount).to.equals(1);
        expect(stubSend.calledWith(response.body)).to.equals(true);

        expect(response.status).to.equals(200);
        expect(response.body).to.exist;
      })
      .should.notify(done);

  });


  it('Should be able to receive a RESTIFY res object, and wrap it on a REJECTED promise', function(done) {
    var callback

    var stubSend = sinon.stub();

    var res = {
      statusCode : 200,
      send: function(status, body){
        res.statusCode = status;
        res.body = body;
        callback();
        stubSend();
      },
      on: function(e, cb){
        callback = cb
      },
      getHeaders: function(){}
    };

    var result = Phrases.runByPath(domain, 'changestatus', 'get', {
      res: res
    });

    expect(result).to.exist;

    result
      .should.be.rejected
      .then(function(response) {
        expect(stubSend.callCount).to.equals(1);

        expect(response.status).to.equals(401);
        expect(response.body).to.exist;
      })
      .should.notify(done);
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

    var result = Phrases.runByPath(domain, 'usecorbeldriver/testvalue', 'get', {
      corbelDriver: mockCorbelDriver
    });

    expect(result).to.exist;

    result
      .should.be.fulfilled
      .then(function() {
        expect(mockCorbelDriver.stubbed.callCount).to.equals(1);
        expect(mockCorbelDriver.stubbed.calledWith('testvalue')).to.equals(true);
      })
      .should.notify(done);

  });

  it('Should be able to require a snippet inside a phrase', function(done) {
    var result = Phrases.runById(domain + '!require-1.2.2');
    result
      .then(function(response) {
        expect(spyRun.callCount).to.equals(1);
        expect(response).to.be.an('object');
        expect(response).to.include.keys(
          'status',
          'body'
        );
        expect(response.status).to.equals(200);

        expect(response.body.iam).to.exist;
        expect(response.body.iam).to.equals('A model');
      })
      .should.notify(done);
  });

  it('should not allow to run an unregistered phrase', function(done) {
    var result = Phrases.runById('nonexisting!id-1.2.2');

    result
      .should.be.rejected
      .then(function() {
        expect(spyRun.callCount).to.equals(0);
      })
      .should.notify(done);
  });

  it('Should not allow to run an unregistered VERB', function(done) {
    var result = Phrases.runById(domain + ':user!:name-1.2.2', 'post');

    result
      .should.be.rejected
      .then(function() {
        expect(spyRun.callCount).to.equals(0);
      })
      .should.notify(done);
  });

  describe('timeout phrases', function() {
    //@TODO: add the timeout handler for function mode
    this.timeout(3000);

    it('cuts the phrase execution at 500 ms', function(done) {
      var result = Phrases.runByPath(domain, 'timeout', 'get', {
        timeout: 500,
        functionMode: false
      });

      result
        .should.be.rejected
        .then(function(response) {
          expect(spyRun.callCount).to.equals(1);
          expect(response.status).to.equals(503);
          expect(stubEvents.calledWith('warn', 'phrase:timedout')).to.equals(true);
        })
        .should.notify(done);
    });

    it('cuts the phrase execution at 500 ms with function mode', function(done) {
      var result = Phrases.runByPath(domain, 'timeoutfunction/500', 'get', {
        timeout: 500,
        functionMode: true
      });

      result
        .should.be.rejected
        .then(function(response) {
          expect(spyRun.callCount).to.equals(1);
          expect(response.status).to.equals(503);
        })
        .should.notify(done);
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
      var result = Phrases.runById(domain + '!changestatus-1.2.2', null, {
        functionMode: false
      });

      result
        .should.be.rejected
        .then(function(response) {
          expect(spyFunction.callCount).to.equals(0);
          expect(spyScript.callCount).to.equals(1);
          expect(response.status).to.equals(401);
        })
        .should.notify(done);
    });

    it('Runs by default with function mode', function(done) {
      var result = Phrases.runById(domain + '!changestatus-1.2.2');

      result
        .should.be.rejected
        .then(function(response) {
          expect(spyFunction.callCount).to.equals(1);
          expect(spyScript.callCount).to.equals(0);
          expect(response.status).to.equals(401);
        })
        .should.notify(done);
    });

  });


});
