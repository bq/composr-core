var events = require('../../src/lib/events'),
  chai = require('chai'),
  sinon = require('sinon'),
  expect = chai.expect;

describe('events', function() {
  describe('events API', function() {
    it('expected methods are available', function() {
      expect(events).to.respondTo('on');
      expect(events).to.respondTo('emit');
      expect(events).to.respondTo('resetSuscriptions');
    });
  });

  describe('emit', function() {

    var stub;

    beforeEach(function() {
      stub = sinon.stub();
      events.on('test', 'testComponent', stub);
    });

    afterEach(function() {
      events.resetSuscriptions();
    });

    it('Does include the callback on the stack of suscriptions', function() {
      events.emit('test');
      expect(stub.callCount).to.equals(1);
    });

    it('Does receive the passed argument', function() {
      events.emit('test', 'Hola');
      expect(stub.callCount).to.equals(1);
      expect(stub.calledWith('Hola')).to.equals(true);
    });

    it('Does receive multiple arguments', function() {
      events.emit('test', 'Hola', 'Test');
      expect(stub.callCount).to.equals(1);
      expect(stub.calledWith('Hola', 'Test')).to.equals(true);
    });
  });

  describe('Multiple suscriptions', function() {
    var maxStubs = 10;
    var stubs = [];

    before(function() {
      for (var i = 0; i < maxStubs; i++) {
        stubs.push(sinon.stub());
      }

      for (var i = 0; i < maxStubs; i++) {
        events.on('testMultiple', 'testComponent' + i, stubs[i]);
      }
    });

    it('Generates multiple emitions', function() {
      events.emit('testMultiple', ':)');

      for (var i = 0; i < maxStubs; i++) {
        expect(stubs[i].callCount).to.equals(1);
        expect(stubs[i].calledWith(':)')).to.equals(true);
      }
    });
  });

  describe('error event name', function(){
    var stub;

    beforeEach(function() {
      stub = sinon.stub();
      events.on('error', 'testComponent', stub);
    });

    afterEach(function() {
      events.resetSuscriptions();
    });

    it('works when emitting an error', function(){
      events.emit('error', 'that:error');
      expect(stub.callCount).to.be.above(0);
      expect(stub.calledWith('that:error')).to.equals(true);
    });

  });
});