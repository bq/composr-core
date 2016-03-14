var virtualDomainDao = require('../../../src/lib/daos/virtualDomainDao'),
  chai = require('chai'),
  expect = chai.expect;

describe('virtualDomainDao', function() {

  it('has the expected api', function(){
    expect(virtualDomainDao).to.respondTo('load');
    expect(virtualDomainDao).to.respondTo('loadAll');
    expect(virtualDomainDao).to.respondTo('loadSome');
    expect(virtualDomainDao).to.respondTo('save');
    //expected(virtualDomainDao).to.respond.to('delete');
  });
});