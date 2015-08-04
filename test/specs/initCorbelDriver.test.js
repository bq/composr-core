'use strict';

var initCorbelDriver = require('../../src/lib/initCorbelDriver'),
  chai = require('chai'),
  chaiAsPromised = require('chai-as-promised'),
  sinon = require('sinon'),
  expect = chai.expect,
  should = chai.should();

chai.use(chaiAsPromised);

describe('initCorbelDriver', function() {

  it('fails without urlbase', function(done) {
    var mockObject = {
      config: {
        credentials: {
          clientId: '1',
          clientSecret : '2',
          scopes : '3'
        }
      }
    };

    initCorbelDriver.bind(mockObject)()
      .should.be.rejected.notify(done);
  });

  it('fails without clientSecret', function(done) {
    var mockObject = {
      config: {
        credentials: {
          urlBase: '1',
          clientId : '2',
          scopes : '3'
        }
      }
    };

    initCorbelDriver.bind(mockObject)()
      .should.be.rejected.notify(done);
  });

  it('fails without scopes', function(done) {
    var mockObject = {
      config: {
        credentials: {
          urlBase: '1',
          clientId : '2',
          clientSecret : '3'
        }
      }
    };

    initCorbelDriver.bind(mockObject)()
      .should.be.rejected.notify(done);
  });

  it('completes with correct structure', function(done) {
    var mockObject = {
      config: {
        credentials: {
          urlBase: 'test',
          clientId: '1',
          clientSecret : '2',
          scopes : '3'
        }
      }
    };

    initCorbelDriver.bind(mockObject)()
      .should.be.fulfilled.notify(done);
  });

});