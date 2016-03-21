var snippetDao = require('../../../src/lib/daos/snippetDao'),
  chai = require('chai'),
  expect = chai.expect;

describe('snippetDao', function() {

  it('has the expected api', function(){
    expect(snippetDao).to.respondTo('load');
    expect(snippetDao).to.respondTo('loadAll');
    expect(snippetDao).to.respondTo('loadSome');
    expect(snippetDao).to.respondTo('save');
    //expected(snippetDao).to.respond.to('delete');
  });
});