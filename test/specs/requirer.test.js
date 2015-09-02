var composr = require('../../src/composr-core'),
  _ = require('lodash'),
  chai = require('chai'),
  sinon = require('sinon'),
  chaiAsPromised = require('chai-as-promised'),
  expect = chai.expect,
  should = chai.should();

chai.use(chaiAsPromised);

var snippetFixtures = require('../../fixtures/snippets');
var utilsPromises = require('../../utils/promises');

describe('Requirer', function() {
  before(function(done) {
    composr.events = {
      emit: sinon.stub()
    };

    composr.Snippets.register(_.pick(snippetFixtures.correct, 3) , 'testDomain')
      .should.be.fulfilled
      .then(function(){
        return composr.Snippets.register(_.pick(snippetFixtures.correct, 3, 4), 'otherDomain');
      })
      .should.be.fulfilled.notify(done);

  });

  it('Can require all the allowed libraries', function(){

  });
 
  it('Can not require a non allowed library', function(){

  });

  it('Can require its own snippets', function(){

  });

  it('Can not request other domain snippets', function(){

  });

  it('Returns null for empty parameter', function(){

  });


});