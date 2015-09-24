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

    res.json({
      user: 'test'
    })
      .should.be.fulfilled
      .then(function(response) {
        expect(response.user).to.equals('test');
        expect(res._action).to.equals('json');
      })
      .should.notify(done);
  });

  it('should resolve on send call', function(done) {
    var res = mockedResponse();

    res.send({
      user: 'test'
    })
      .should.be.fulfilled
      .then(function(response) {
        expect(response).to.include.keys(
          'status',
          'body'
        );

        expect(response.body.user).to.equals('test');
        expect(response.status).to.equals(200);
        expect(res._action).to.equals('send');
      })
      .should.notify(done);
  });

  it('should resolve on send call with a status', function(done) {
    var res = mockedResponse();

    res.status(204).send({
      user: 'test'
    })
      .should.be.fulfilled
      .then(function(response) {
        expect(response).to.include.keys(
          'status',
          'body'
        );

        expect(response.body.user).to.equals('test');
        expect(response.status).to.equals(204);
        expect(res._action).to.equals('send');
      })
      .should.notify(done);
  });

  it('should reject on send call with a status 40X', function(done) {
    var res = mockedResponse();

    res.status(405).send({
      user: 'test'
    })
      .should.be.rejected
      .then(function(response) {
        expect(response).to.include.keys(
          'status',
          'body'
        );

        expect(response.body.user).to.equals('test');
        expect(response.status).to.equals(405);
        expect(res._action).to.equals('send');
      })
      .should.notify(done);
  });

});