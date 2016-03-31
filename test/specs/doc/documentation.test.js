'use strict';

var documentation = require('../../../src/lib/doc/documentation'),
  chai = require('chai'),
  chaiAsPromised = require('chai-as-promised'),
  sinon = require('sinon'),
  PhraseModel = require('../../../src/lib/models/PhraseModel'),
  expect = chai.expect,
  should = chai.should();

chai.use(chaiAsPromised);

var phrases = require('../../fixtures/phrases');
var correctPhrases = phrases.correct;
var malformedPhrases = phrases.malformed;

var docmethod, phrasesToRegister;

describe('Documentation', function() {
  this.timeout(10000);
  var stub;

  beforeEach(function() {
    stub = sinon.stub();

    docmethod = documentation.bind({
      config: {
        urlBase: 'test'
      },
      events: {
        emit: stub
      }
    });

    phrasesToRegister = correctPhrases.map(function(item){
      return new PhraseModel(item, 'test:domain');
    });
  });

  it('Compiles correctly', function(done) {
    docmethod(phrasesToRegister)
      .should.be.fulfilled
      .then(function(result) {
        expect(result).to.be.a('string');
        expect(result.indexOf('DOCTYPE') !== -1).to.equals(true);
      })
      .should.notify(done);
  });

  //TODO: add tests for snippets, and versions and so on
});