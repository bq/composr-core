var loginManager = require('../../src/lib/loginManager'),
  corbel = require('corbel-js');
  chai = require('chai'),
  sinon = require('sinon'),
  expect = chai.expect;

var utilsPromises = require('../utils/promises');

describe('loginManager', function() {
  var stubEvents;

  beforeEach(function() {
    stubEvents = sinon.stub();
    //Mock the events object
    loginManager.events = {
      emit: stubEvents
    };
  });

  it('has the specified API', function() {
    expect(loginManager).to.respondTo('clientLogin');
    expect(loginManager).to.respondTo('_driverLogin');
  });

  describe('if driver login fails', function() {
    var stubDriverLogin;

    beforeEach(function() {
      stubDriverLogin = sinon.stub(loginManager, '_driverLogin', utilsPromises.rejectedPromise);
    });

    afterEach(function() {
      stubDriverLogin.restore();
    });

    it('rejects the login', function(done) {
      loginManager.clientLogin()
        .should.be.rejected.notify(done);
    });

    it('emits an event with an error', function(done) {
      loginManager.clientLogin()
        .should.be.rejected
        .then(function(err) {
          expect(stubEvents.callCount).to.equals(1);
          expect(stubEvents.calledWith('error', 'login:invalid')).to.equals(true);
        })
        .should.notify(done);
    });
  });

  describe('if driver login works', function() {
    var stubDriverLogin;

    beforeEach(function() {
      stubDriverLogin = sinon.stub(loginManager, '_driverLogin', utilsPromises.resolvedCurriedPromise({
        data: 'OK'
      }));
    });

    afterEach(function() {
      stubDriverLogin.restore();
    });

    it('accepts the login', function(done) {
      loginManager.clientLogin()
        .should.be.fulfilled.notify(done);
    });

    it('emits an event with a success', function(done) {
      loginManager.clientLogin()
        .should.be.fulfilled
        .then(function() {
          expect(stubEvents.callCount).to.equals(1);
          expect(stubEvents.calledWith('info', 'login:successful')).to.equals(true);
        })
        .should.notify(done);
    });
  });

});