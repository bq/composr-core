'use strict';

var documentation = require('../../../src/lib/doc/documentation'),
  chai = require('chai'),
  chaiAsPromised = require('chai-as-promised'),
  sinon = require('sinon'),
  expect = chai.expect,
  should = chai.should();

chai.use(chaiAsPromised);

var phrases = require('../../fixtures/phrases');
var correctPhrases = phrases.correct;
var malformedPhrases = phrases.malformed;

var docmethod;

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
  });

  it('Compiles correctly', function(done) {
    docmethod(correctPhrases)
      .should.be.fulfilled
      .then(function(result) {
        expect(result).to.be.a('string');
        expect(result.indexOf('DOCTYPE') !== -1).to.equals(true);
      })
      .should.notify(done);
  });

  it('Does not break with invalid phrases', function(done) {
    docmethod(malformedPhrases)
      .should.be.fulfilled
      .then(function(result) {
        expect(result).to.be.a('string');
        expect(result.indexOf('DOCTYPE') !== -1).to.equals(true);
      })
      .should.notify(done);
  });


  it('Does emit an event telling that some phrase could not be processed', function(done) {
    docmethod([malformedPhrases[0]])
      .should.be.fulfilled
      .then(function(result) {
        expect(stub.callCount).to.equals(1);
        expect(stub.calledWith('warn', 'generating:documentation:invalid-phrase')).to.equals(true);
      })
      .should.notify(done);
  });

});