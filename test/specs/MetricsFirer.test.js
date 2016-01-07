var MetricsFirer = require('../../src/lib/MetricsFirer'),
  events = require('../../src/lib/events'),
  chai = require('chai'),
  sinon = require('sinon'),
  expect = chai.expect;

describe('MetricsFirer', function() {
  describe('MetricsFirer API', function() {
    it('is a constructor', function() {
      expect(MetricsFirer).to.be.a('function');
      var instance = new MetricsFirer();
      expect(instance).to.respondTo('emit');
    });
  });

  describe('emit', function() {

    var stub;

    beforeEach(function() {
      stub = sinon.stub();
      events.on('metrics', 'testComponent', stub);
    });

    afterEach(function() {
      events.resetSuscriptions();
    });

    it('Does emit an event in the events module', function() {
      var metricsInstance = new MetricsFirer('mydomain');

      metricsInstance.emit('test');
      expect(stub.callCount).to.equals(1);
    });

    it('Does receive the passed argument', function() {
      var metricsInstance = new MetricsFirer('mydomain');

      metricsInstance.emit('Hola');

      expect(stub.callCount).to.equals(1);
      expect(stub.calledWith({ domain : 'mydomain', data : 'Hola'})).to.equals(true);
    });
  });

  describe('Multiple firers', function() {
    var maxStubs = 10;
    var stub = null;

    before(function() {
      stub = sinon.stub();

      events.on('metrics', 'testComponentMultipleFirers', stub);

    });

    it('Generates multiple emitions', function() {
      for (var i = 0; i < maxStubs; i++) {
        var metricsInstance = new MetricsFirer('mydomain'+i);
        metricsInstance.emit({ name : 'pageLodaded', time : 1000})
      }

      expect(stub.callCount).to.equals(maxStubs);
    });
  });

});