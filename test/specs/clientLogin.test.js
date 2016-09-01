var clientLogin = require('../../src/lib/clientLogin'),
  corbel = require('corbel-js'),
  driverStore = require('../../src/lib/stores/corbelDriver.store'),
  chai = require('chai'),
  sinon = require('sinon'),
  expect = chai.expect;

var utilsPromises = require('../utils/promises');

describe('clientLogin', function() {
  var stubEvents, cLogin;

  beforeEach(function() {
    stubEvents = sinon.stub();

    cLogin = clientLogin.bind({
      events: {
        emit: stubEvents
      }
    });
  });

  it('has the specified API', function() {
    expect(clientLogin).to.be.a('function');
  });

  it('rejects if missing corbelDriver', function(done) {
    driverStore.setDriver(null);

    cLogin()
      .should.be.rejected
      .then(function(err) {
        expect(err).to.equals('error:missing:corbelDriver');
        expect(stubEvents.callCount).to.equals(1);
        expect(stubEvents.calledWith('error', 'error:missing:corbelDriver')).to.equals(true);
      })
      .should.notify(done);
  });

  describe('If corbelDriver rejects the login', function() {

    beforeEach(function() {
      driverStore.setDriver({
        iam: {
          token: function() {
            return {
              create: utilsPromises.rejectedCurriedPromise('error')
            }
          }
        }
      });

      cLogin = clientLogin.bind({
        events: {
          emit: stubEvents
        }
      });
    });

    it('throws an event and rejects the promise', function(done) {
      cLogin()
        .should.be.rejected
        .then(function(err) {
          expect(err).to.equals('error');
          expect(stubEvents.callCount).to.equals(1);
          expect(stubEvents.calledWith('error', 'login:invalid:credentials')).to.equals(true);
        })
        .should.notify(done);
    });
  });

  describe('If corbelDriver accepts the login', function() {

    beforeEach(function() {
      driverStore.setDriver({
        iam: {
          token: function() {
            return {
              create: utilsPromises.resolvedCurriedPromise({
                data: {
                  accessToken: 'asdsadsad'
                }
              })
            }
          }
        }
      });

      cLogin = clientLogin.bind({
        events: {
          emit: stubEvents
        }
      });
    });

    it('throws an event and accepts the promise', function(done) {
      cLogin()
        .should.be.fulfilled
        .then(function(data) {
          expect(data).to.be.a('string');
          expect(data).to.equals('asdsadsad');
          expect(stubEvents.callCount).to.equals(1);
          expect(stubEvents.calledWith('debug', 'login:successful')).to.equals(true);
        })
        .should.notify(done);
    });
  });

  describe('If corbelDriver resolves but with invalid response', function() {

    beforeEach(function() {
      driverStore.setDriver({
        iam: {
          token: function() {
            return {
              create: utilsPromises.resolvedCurriedPromise('iAmBad')
            }
          }
        }
      });

      cLogin = clientLogin.bind({
        events: {
          emit: stubEvents
        }
      });
    });

    it('throws an event and accepts the promise', function(done) {
      cLogin()
        .should.be.rejected
        .then(function(err) {
          expect(err.message).to.be.equals('login:invalid:response');
          expect(stubEvents.callCount).to.equals(1);
          expect(stubEvents.calledWith('error', 'login:invalid:response')).to.equals(true);
        })
        .should.notify(done);
    });
  });

});