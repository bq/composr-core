var composr = require('../../src/composr-core'),
  logClient = require('../../src/lib/logClient'),
  ComposrError = require('../../src/lib/ComposrError'),
  corbel = require('corbel-js');
  chai = require('chai'),
  sinon = require('sinon'),
  expect = chai.expect;

var utilsPromises = require('../utils/promises');

describe('logClient', function() {

  /*var badCredentials = [{
    clientId : 'wa',
    clientSecret: 'we',
    scopes : 'asd',
    urlBase : 'as'
  },
  {
    clientId : '567b0e87',
    clientSecret: 'aa776bdcdb2bb3e1ea967520022af436fc4764b7c2d82b16810691edcdb75710',
    scopes : 'apps-sandbox-composr',
    urlBase : ''
  },{
    clientId : '567b0e87',
    clientSecret: 'we',
    scopes : 'apps-sandbox-composr',
    urlBase : 'https://{{module}}-int.bqws.io/v1.0/'
  },{
    clientId : '',
    clientSecret: 'aa776bdcdb2bb3e1ea967520022af436fc4764b7c2d82b16810691edcdb75710',
    scopes : 'apps-sandbox-composr',
    urlBase : 'https://{{module}}-int.bqws.io/v1.0/'
  }];*/

  it('fails if bad credentials are provided', function(done) {
    var options = {
      credentials : {
        clientId : 'wa',
        clientSecret: 'we',
        scopes : 'asd',
        urlBase : 'as'
      }
    }

    var corbelDriver = corbel.getDriver(options.credentials);

    logClient.bind({
      corbelDriver : corbelDriver
    })()
    .then(function(){
      done('Failing');
    })
    .catch(function(err){
      expect(err).to.exist;
      expect(err).to.be.an.instanceof(ComposrError);
      done();
    });
  });

  it('passes if good credentials are provided', function(done) {
    var options = {
      credentials : {
      "clientId": "567b0e87",
      "clientSecret": "aa776bdcdb2bb3e1ea967520022af436fc4764b7c2d82b16810691edcdb75710",
      "scopes": "apps-sandbox-composr",
      "urlBase": "https://{{module}}-int.bqws.io/v1.0/"
      }
    }

    var corbelDriver = corbel.getDriver(options.credentials);

    logClient.bind({
      corbelDriver : corbelDriver
    })()
    .then(function(){
      done();
    })
    .catch(function(err){
      console.log(err);
      done(err);
    });
  });

});