var mockedRequest = require('../../../src/lib/mock/mockedRequest'),
  chai = require('chai'),
  sinon = require('sinon'),
  expect = chai.expect,
  should = chai.should();

describe('MockedRequest', function() {

  it('should have the req properties', function() {
    expect(mockedRequest()).to.include.keys(
      'params',
      'query',
      'headers',
      'body'
    );

  });

  it('should expose the req API', function() {
    var req = mockedRequest();

    expect(req).to.respondTo('get');
  });

  it('should pass the params', function() {
    var req = mockedRequest({
      params: {
        userId: 1,
        name: 'test'
      }
    });

    expect(req.params).to.include.keys(
      'userId',
      'name'
    );

    expect(req.params.userId).to.equals(1);
    expect(req.params.name).to.equals('test');
  });

  it('should pass the query parameters', function() {
    var req = mockedRequest({
      query: {
        userId: 1,
        name: 'test'
      }
    });

    expect(req.query).to.include.keys(
      'userId',
      'name'
    );

    expect(req.query.userId).to.equals(1);
    expect(req.query.name).to.equals('test');
  });

  it('should receive the headers', function() {
    var req = mockedRequest({
      headers: {
        userId: 1,
        name: 'test'
      }
    });

    expect(req.get('userId')).to.equals(1);
    expect(req.get('name')).to.equals('test');
  });

  it('should receive the body', function() {
    var req = mockedRequest({
      body: {
        userId: 1,
        name: 'test'
      }
    });

    expect(req.body.userId).to.equals(1);
    expect(req.body.name).to.equals('test');
  });

});