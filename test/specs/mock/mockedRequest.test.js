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
    var req = mockedRequest(null, null, {
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
    var req = mockedRequest(null, null, {
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
    var req = mockedRequest(null, null, {
      headers: {
        UserId: 1,
        Name: 'test',
        'Content-Type': 'fake'
      }
    });

    expect(req.get('UserId')).to.equals(1);
    expect(req.get('Name')).to.equals('test');
    expect(req.get('Content-Type')).to.equals('fake');
  });

  it('should capitalize the headers', function() {
    var req = mockedRequest('restify', null, {
      headers: {
        userId: 1,
        name: 'test',
        'content-type': 'fake'
      }
    });

    expect(req.headers).to.include.keys('UserId', 'Name', 'Content-Type');
  });

  it('should capitalize the get header param', function() {
    var req = mockedRequest('restify', null, {
      headers: {
        TestHeader: 'fake'
      }
    });

    expect(req.get('testHeader')).to.equals('fake');
  });

  it('should capitalize the get compund header param', function() {
    var req = mockedRequest('restify', null, {
      headers: {
        'Content-Type': 'test'
      }
    });

    expect(req.get('content-type')).to.equals('test');
  });

  it('should receive the body', function() {
    var req = mockedRequest(null, null, {
      body: {
        userId: 1,
        name: 'test'
      }
    });

    expect(req.body.userId).to.equals(1);
    expect(req.body.name).to.equals('test');
  });

});
