var MockedResponse = require('../../../src/lib/mock/mockedResponse'),
  chai = require('chai'),
  sinon = require('sinon'),
  chaiAsPromised = require('chai-as-promised'),
  expect = chai.expect,
  should = chai.should();

chai.use(chaiAsPromised);

describe('Mocked Response', function() {

  it('should expose the res API', function() {
    var res = new MockedResponse();

    expect(res).to.respondTo('status');
    expect(res).to.respondTo('send');
    expect(res).to.respondTo('cookie');
    expect(res).to.respondTo('on');
    expect(res).to.respondTo('setHeader');
    expect(res).to.respondTo('setHeaders');
  });

  it('should assign the status', function() {
    var res = new MockedResponse();

    res.status(401);
    expect(res.statusCode).to.equals(401);
  });

  it('should return the req object on the status method', function() {
    var res = new MockedResponse();
    res = res.status(401);
    expect(res).to.respondTo('status');
    expect(res).to.respondTo('send');
  });

  it('should call the end callback on send call', function(done) {
    var res = new MockedResponse();
    var data = {
      user: 'test'
    };

    res.on('end', function(response){
      expect(response).to.include.keys(
        'status',
        'body'
      );

      expect(response.body.user).to.equals('test');
      expect(response.status).to.equals(200);
      done()
    })

    res.send(data)
  });

  it('should resolve on send call with data and contain Content-Length header with data length', function(done) {
    var res = new MockedResponse();
    var data = {
      user: 'test'
    };

    res.on('end', function(response){
      expect(response).to.include.keys(
        'status',
        'body'
      );

      expect(response).to.include.keys('headers');
      expect(response.headers['Content-Length']).to.equals(data.toString().length);
      done()
    })

    res.send(data)
  });

  it('should resolve on send call without data and contain Content-Length header with 0 value', function(done) {
    var res = new MockedResponse();

    res.on('end', function(response){
      expect(response.headers['Content-Length']).to.equals(0);
      done()
    })

    res.send(200)
  });

  it('should resolve on send call with 0 and contain Content-Length header with 1', function(done) {
    var res = new MockedResponse();

    res.on('end', function(response){
      expect(response.headers['Content-Length']).to.equals(1);
      done()
    })

    res.send(200, 0)
  });

  it('should resolve on send call with null and contain Content-Length header with 0', function(done) {
    var res = new MockedResponse();

    res.on('end', function(response){
      expect(response.headers['Content-Length']).to.equals(0);
      expect(response.status).to.equals(200);
      done()
    })

    res.send(null)
  });

  it('should resolve on send call with false and contain Content-Length header with 5', function(done) {
    var res = new MockedResponse();

    res.on('end', function(response){
      expect(response.headers['Content-Length']).to.equals(5);
      expect(response.status).to.equals(200);
      done()
    })

    res.send(false)
  });

  it('should resolve on send call with empty string and contain Content-Length header with 0', function(done) {
    var res = new MockedResponse();

    res.on('end', function(response){
      expect(response.headers['Content-Length']).to.equals(0);
      expect(response.status).to.equals(200);
      done()
    })

    res.send('')
  });

  it('should resolve on send call with a status', function(done) {
    var res = new MockedResponse();
    var data = {
      user: 'test'
    };

    res.on('end', function(response){
      expect(response.status).to.equals(204);
      expect(response).to.include.keys(
          'status',
          'body'
        );

      expect(response.body.user).to.equals('test');
      done()
    })

    res.send(204, data);
  });

  it('should send call with a status 40X', function(done) {
    var res = new MockedResponse();
    var data = {
      user: 'test'
    };

    res.on('end', function(response){
      expect(response.status).to.equals(405);
      expect(response).to.include.keys(
          'status',
          'body'
        );

      expect(response.body.user).to.equals('test');
      done()
    })

    res.send(405, data);
  });

  it('should invoke the cookie method on the original response object, restify', function(){
    var originalRes = {
      setCookie : sinon.stub()
    };

    var res = new MockedResponse(originalRes);

    res.cookie('yes', 'no', 'maybe');

    expect(originalRes.setCookie.calledOnce).to.equals(true);
    expect(originalRes.setCookie.calledWith('yes', 'no', 'maybe')).to.equals(true);
  });

  it('should invoke the setHeader method on the original response object, restify', function(){
    var originalRes = {
      header : sinon.stub()
    };

    var res = new MockedResponse(originalRes);

    res.setHeader('Content-Length', 7);

    expect(originalRes.header.calledOnce).to.equals(true);
    expect(originalRes.header.calledWith('Content-Length', 7)).to.equals(true);
  });

  it('should invoke the setHeaders method on the original response object, restify', function(){
    var originalRes = {
      header : sinon.stub()
    };

    var headers = {
        'Content-Length': 7,
        'Test-Header': 'foo'
    };

    var res = new MockedResponse(originalRes);

    res.setHeaders(headers);

    expect(originalRes.header.callCount).to.equals(2);
  });

  it('doesnt break if the original response object has no cookie function', function(){
    var originalRes = {};

    var res = new MockedResponse(originalRes);

    var fn = function(){
      res.cookie('yes', 'no', 'maybe');
    };

    expect(fn).to.not.throw(Error);
  });

});
