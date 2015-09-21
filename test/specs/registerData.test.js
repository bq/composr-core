var composr = require('../../src/composr-core'),
  chai = require('chai'),
  sinon = require('sinon'),
  expect = chai.expect;


describe('register data method', function() {

  var spyRegisterPhrases, spyRegisterSnippets;

  before(function() {
    composr.data = {
      phrases: [{
        id: 'test!phrase'
      }, {
        id: 'test!phrase2'
      }],
      snippets: [{
        id: 'test!snippet'
      }]
    };

    spyRegisterPhrases = sinon.spy(composr.Phrases, 'register');
    spyRegisterWithoutDomainPhrases = sinon.spy(composr.Phrases, 'registerWithoutDomain');
    spyRegisterSnippets = sinon.spy(composr.Snippets, 'register');
    spyRegisterWithoutDomainSnippets = sinon.spy(composr.Snippets, 'registerWithoutDomain');
  });

  it('Invokes the register methods on the Phrases and Snippets objects', function(done) {
    composr.registerData()
      .then(function() {
        expect(composr.data.phrases).to.exist;
        expect(composr.data.snippets).to.exist;
        expect(spyRegisterPhrases.callCount).to.equals(1);
        expect(spyRegisterPhrases.calledWith('test', [{
          id: 'test!phrase'
        }, {
          id: 'test!phrase2'
        }])).to.equals(true);
        expect(spyRegisterSnippets.callCount).to.equals(1);
        expect(spyRegisterSnippets.calledWith('test', [{
          id: 'test!snippet'
        }])).to.equals(true);
        done();
      })
      .catch(done);
  });

});