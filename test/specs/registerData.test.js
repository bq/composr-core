var composr = require('../../src/composr-core'),
  chai = require('chai'),
  sinon = require('sinon'),
  expect = chai.expect;


describe('register data method', function() {

  var spyRegisterPhrases, spyRegisterSnippets;

  before(function() {
    composr.data = {
      phrases : [],
      snippets : []
    };
    spyRegisterPhrases = sinon.spy(composr.Phrases, 'register');
    spyRegisterSnippets = sinon.spy(composr.Snippets, 'register');
  });

  it('Invokes the register methods on the Phrases and Snippets objects', function(done){
    composr.registerData()
      .then(function(){
        expect(composr.data.phrases).to.exist;
        expect(composr.data.snippets).to.exist;
        expect(spyRegisterPhrases.callCount).to.equals(1);
        expect(spyRegisterSnippets.callCount).to.equals(1);
        done();
      })
      .catch(done);
  });

});
