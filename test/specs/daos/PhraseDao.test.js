var phraseDao = require('../../../src/lib/daos/phraseDao'),
  chai = require('chai'),
  expect = chai.expect;

describe('phraseDao', function() {

  it('has the expected api', function(){
    expect(phraseDao).to.respondTo('load');
    expect(phraseDao).to.respondTo('loadAll');
    expect(phraseDao).to.respondTo('loadSome');
    expect(phraseDao).to.respondTo('save');
    //expected(phraseDao).to.respond.to('delete');
  });
});