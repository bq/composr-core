'use strict';

var codeCompiler = require('../../../src/lib/compilers/code.compiler'),
  chai = require('chai'),
  chaiAsPromised = require('chai-as-promised'),
  sinon = require('sinon'),
  q = require('q'),
  expect = chai.expect,
  should = chai.should();

chai.use(chaiAsPromised);

var correctPhrases = require('../../fixtures/phrases').correct;

describe('Code Compiler', function() {

  it('exposes the needed prototype', function() {
    expect(codeCompiler.prototype).to.respondTo('register');
    expect(codeCompiler.prototype).to.respondTo('_register');
    expect(codeCompiler.prototype).to.respondTo('unregister');
    expect(codeCompiler.prototype).to.respondTo('_unregister');
    expect(codeCompiler.prototype).to.respondTo('compile');
    expect(codeCompiler.prototype).to.respondTo('_compile');
    expect(codeCompiler.prototype).to.respondTo('_addToList');
    expect(codeCompiler.prototype).to.respondTo('__preCompile');
    expect(codeCompiler.prototype).to.respondTo('__preAdd');
    expect(codeCompiler.prototype).to.respondTo('validate');
    expect(codeCompiler.prototype).to.respondTo('resetItems');
    expect(codeCompiler.prototype).to.respondTo('_evaluateCode');
    expect(codeCompiler.prototype).to.respondTo('_extractDomainFromId');
  });

  describe('Code evaluation', function() {
    var compiler, stubEvents;

    beforeEach(function() {
      compiler = new codeCompiler({
        itemName: 'test-object',
        item: 'myItems'
      });

      stubEvents = sinon.stub();
      //Mock the composr external methods
      compiler.events = {
        emit: stubEvents
      };
    });

    it('should evaluate a function', function() {
      var result = compiler._evaluateCode('console.log(a);');
      expect(result.fn).to.be.a('function');
      expect(result.error).to.equals(false);
    });

    it('launches an event with the evaluation', function() {
      var result = compiler._evaluateCode('console.log(a);');
      expect(stubEvents.callCount).to.equals(1);
      expect(stubEvents.calledWith('debug', 'test-object:evaluatecode:good')).to.equals(true);
    });

    it('fails with a wrong code', function() {
      var result = compiler._evaluateCode('};');
      expect(result.fn).to.equals(null);
      expect(result.error).to.not.equals(false);

      expect(stubEvents.callCount).to.equals(1);
      expect(stubEvents.calledWith('warn', 'test-object:evaluatecode:wrong_code')).to.equals(true);
    });

  });

  describe('Item registration', function() {
    var compiler;

    beforeEach(function() {
      compiler = new codeCompiler({
        itemName: 'phrases',
        item: '__myList',
        validator: function(item) {
          return q.resolve(item);
        }
      });

      compiler.events = {
        emit: sinon.stub()
      };

    });

    describe('Secure methods called', function() {
      var spyCompile, spyValidate, spy_compile, spyRegister, spyAddToList;

      beforeEach(function() {
        spyRegister = sinon.spy(compiler, '_register');
        spyCompile = sinon.spy(compiler, 'compile');
        spyValidate = sinon.spy(compiler, 'validate');
        spy_compile = sinon.spy(compiler, '_compile');
        spyAddToList = sinon.spy(compiler, '_addToList');
      });

      afterEach(function() {
        spyRegister.restore();
        spyCompile.restore();
        spyValidate.restore();
        spy_compile.restore();
        spyAddToList.restore();
      });

      it('should call the compilation and validation methods when registering', function(done) {

        compiler.register('test-domain', 'Something to register')
          .should.be.fulfilled
          .then(function() {
            expect(spyCompile.callCount).to.equals(1);
            expect(spy_compile.callCount).to.equals(1);
            expect(spyValidate.callCount).to.equals(1);
          })
          .should.be.fulfilled.notify(done);
      });

      it('should call the _register method with the domain', function(done) {

        compiler.register('test-domain', 'Something to register')
          .should.be.fulfilled
          .then(function() {
            expect(spyRegister.callCount).to.equals(1);
            expect(spyRegister.calledWith('test-domain', 'Something to register')).to.equals(true);
          })
          .should.be.fulfilled.notify(done);
      });

      it('should call the _addToList method with the domain', function(done) {

        compiler.register('test-domain', 'Something to register')
          .should.be.fulfilled
          .then(function() {
            expect(spyAddToList.callCount).to.equals(1);
            expect(spyAddToList.calledWith('test-domain')).to.equals(true);
          })
          .should.be.fulfilled.notify(done);
      });

    });
  });

  describe('Item reseting', function() {
    var compiler;

    beforeEach(function() {

      compiler = new codeCompiler({
        item: '__mything'
      });

      compiler.__mything = 'SanFrancisco';

    });

    afterEach(function() {
      compiler.__mything = null;
    });

    it('Resets the item to an empty object', function() {
      compiler.resetItems();
      expect(Object.keys(compiler.__mything).length).to.equals(0);
    });
  });


  describe('Domain extraction', function() {

    var compiler = new codeCompiler({
      item: '__mything'
    });

    var testItems = [{
      id: 'booqs:demo!loginuser',
      value: 'booqs:demo'
    }, {
      id: 'test-client!myphrase!:parameter',
      value: 'test-client'
    }, {
      id: 'booqs:demo!bookWarehouseDetailMock!:id',
      value: 'booqs:demo'
    }, {
      id: 'booqs:demo!UserModel',
      value: 'booqs:demo'
    }];

    it('Extracts all the domains correctly', function() {
      testItems.forEach(function(item) {
        expect(compiler._extractDomainFromId(item.id)).to.equals(item.value);
      });
    });

  });

  //TODO test the other methods here instead in phrases.

});