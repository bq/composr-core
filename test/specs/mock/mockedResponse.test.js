var mockedResponse = require('../../../src/lib/mock/mockedResponse'),
  chai = require('chai'),
  sinon = require('sinon'),
  chaiAsPromised = require('chai-as-promised'),
  expect = chai.expect,
  should = chai.should();

chai.use(chaiAsPromised);

describe('Mocked Response', function() {

  it('should expose the res API', function() {
    var res = mockedResponse();

    expect(res).to.respondTo('json');
    expect(res).to.respondTo('status');
    expect(res).to.respondTo('send');
    expect(res).to.respondTo('cookie');
    expect(res).to.respondTo('setHeader');
    expect(res).to.respondTo('setHeaders');
    expect(res).to.have.ownProperty('promise');
  });

  it('should assign the status', function() {
    var res = mockedResponse();

    res.status(401);
    expect(res.statusCode).to.equals(401);
  });

  it('should return the req object on the status method', function() {
    var res = mockedResponse();
    res = res.status(401);
    expect(res).to.respondTo('json');
    expect(res).to.respondTo('status');
    expect(res).to.respondTo('send');
    expect(res).to.have.ownProperty('promise');
  });

  it('should resolve on json call', function(done) {
    var res = mockedResponse();
    var data = {
      user: 'test'
    };
    res.json(data)
      .should.be.fulfilled
      .then(function(response) {
        expect(response.body.user).to.equals('test');
        expect(response.headers['Content-Length']).to.equals(data.toString().length);
        expect(res._action).to.equals('json');
      })
      .should.notify(done);
  });

  it('should resolve on send call', function(done) {
    var res = mockedResponse();
    var data = {
      user: 'test'
    };

    res.send(data)
      .should.be.fulfilled
      .then(function(response) {
        expect(response).to.include.keys(
          'status',
          'body',
          'headers'
        );

        expect(response.body.user).to.equals('test');
        expect(response.headers['Content-Length']).to.equals(data.toString().length);
        expect(response.status).to.equals(200);
        expect(res._action).to.equals('send');
      })
      .should.notify(done);
  });

  it('should resolve on send call with a status', function(done) {
    var res = mockedResponse();
    var data = {
      user: 'test'
    };

    res.status(204).send(data)
      .should.be.fulfilled
      .then(function(response) {
        expect(response).to.include.keys(
          'status',
          'body',
          'headers'
        );

        expect(response.body.user).to.equals('test');
        expect(response.headers['Content-Length']).to.equals(data.toString().length);
        expect(response.status).to.equals(204);
        expect(res._action).to.equals('send');
      })
      .should.notify(done);
  });

  it('should reject on send call with a status 40X', function(done) {
    var res = mockedResponse();
    var data = {
      user: 'test'
    };

    res.status(405).send(data)
      .should.be.rejected
      .then(function(response) {
        expect(response).to.include.keys(
          'status',
          'body',
          'headers'
        );

        expect(response.body.user).to.equals('test');
        expect(response.headers['Content-Length']).to.equals(data.toString().length);
        expect(response.status).to.equals(405);
        expect(res._action).to.equals('send');
      })
      .should.notify(done);
  });

  it('should invoke the cookie method on the original response object', function(){
    var originalRes = {
      cookie : sinon.stub()
    };

    var res = mockedResponse('express', originalRes);

    res.cookie('yes', 'no', 'maybe');

    expect(originalRes.cookie.calledOnce).to.equals(true);
    expect(originalRes.cookie.calledWith('yes', 'no', 'maybe')).to.equals(true);
  });

  it('should invoke the cookie method on the original response object, restify', function(){
    var originalRes = {
      setCookie : sinon.stub()
    };

    var res = mockedResponse(null, originalRes);

    res.cookie('yes', 'no', 'maybe');

    expect(originalRes.setCookie.calledOnce).to.equals(true);
    expect(originalRes.setCookie.calledWith('yes', 'no', 'maybe')).to.equals(true);
  });

  it('should invoke the setHeader method on the original response object', function(){
    var originalRes = {
      set : sinon.stub()
    };

    var res = mockedResponse('express', originalRes);

    res.setHeader('Content-Length', 7);

    expect(originalRes.set.calledOnce).to.equals(true);
    expect(originalRes.set.calledWith('Content-Length', 7)).to.equals(true);
  });

  it('should invoke the setHeader method on the original response object, restify', function(){
    var originalRes = {
      header : sinon.stub()
    };

    var res = mockedResponse(null, originalRes);

    res.setHeader('Content-Length', 7);

    expect(originalRes.header.calledOnce).to.equals(true);
    expect(originalRes.header.calledWith('Content-Length', 7)).to.equals(true);
  });

  it('should invoke the setHeaders method on the original response object', function(){
    var originalRes = {
      set : sinon.stub()
    };

    var headers = {
        'Content-Length': 7,
        'Test-Header': 'foo'
    };

    var res = mockedResponse('express', originalRes);

    res.setHeaders(headers);

    expect(originalRes.set.calledOnce).to.equals(true);
    expect(originalRes.set.calledWith(headers)).to.equals(true);
  });

  it('should invoke the setHeaders method on the original response object, restify', function(){
    var originalRes = {
      header : sinon.stub()
    };

    var headers = {
        'Content-Length': 7,
        'Test-Header': 'foo'
    };

    var res = mockedResponse(null, originalRes);

    res.setHeaders(headers);

    expect(originalRes.header.callCount).to.equals(2);
  });

  it('doesnt break if the original response object has no cookie function', function(){
    var originalRes = {};

    var res = mockedResponse(null, originalRes);

    var fn = function(){
      res.cookie('yes', 'no', 'maybe');
    };

    expect(fn).to.not.throw(Error);
  });

});
