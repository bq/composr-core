'use strict';

var snippetWrapper = require('../../../src/lib/compilers/snippet.wrapper'),
  chai = require('chai'),
  expect = chai.expect,
  should = chai.should();

describe.skip('Snippet Wrapper', function() {

  it('Wraps the code correctly', function() {
    var code = 'var a = 3; exports(a);';
    code = snippetWrapper(code);
    expect(code).to.equals('function(exports){\nvar a = 3; exports(a);\n}');
  });

});