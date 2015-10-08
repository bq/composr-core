'use strict';

var CodeCompiler = require('../../../src/lib/compilers/code.compiler'),
  chai = require('chai'),
  chaiAsPromised = require('chai-as-promised'),
  sinon = require('sinon'),
  q = require('q'),
  expect = chai.expect,
  should = chai.should();

chai.use(chaiAsPromised);

var correctPhrases = require('../../fixtures/phrases').correct;
var utilsPromises = require('../../utils/promises');

describe('Code Compiler', function() {

    it('exposes the needed prototype', function() {
      expect(CodeCompiler.prototype).to.respondTo('register');
      expect(CodeCompiler.prototype).to.respondTo('registerWithoutDomain');
      expect(CodeCompiler.prototype).to.respondTo('_register');
      expect(CodeCompiler.prototype).to.respondTo('unregister');
      expect(CodeCompiler.prototype).to.respondTo('_unregister');
      expect(CodeCompiler.prototype).to.respondTo('compile');
      expect(CodeCompiler.prototype).to.respondTo('_compile');
      expect(CodeCompiler.prototype).to.respondTo('_addToList');
      expect(CodeCompiler.prototype).to.respondTo('__preCompile');
      expect(CodeCompiler.prototype).to.respondTo('__preAdd');
      expect(CodeCompiler.prototype).to.respondTo('validate');
      expect(CodeCompiler.prototype).to.respondTo('resetItems');
      expect(CodeCompiler.prototype).to.respondTo('_evaluateCode');
      expect(CodeCompiler.prototype).to.respondTo('_extractDomainFromId');
    });

    describe('Code evaluation', function() {
      var compiler, stubEvents;

      beforeEach(function() {
        compiler = new CodeCompiler({
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
        expect(result.script).to.be.a('object');
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
      var compiler, stubEvents;

      beforeEach(function() {
        compiler = new CodeCompiler({
          itemName: 'phrases',
          item: '__myList',
          validator: function(item) {
            return q.resolve(item);
          }
        });

        stubEvents = sinon.stub();

        compiler.events = {
          emit: stubEvents
        };

      });

      it('should allow to register an array of items', function(done) {
        compiler.register('domain', [{
          id: '1'
        }, {
          id: '2'
        }])
          .should.be.fulfilled
          .then(function(result) {
            expect(result).to.be.an('array');
            expect(result.length).to.equals(2);
          })
          .should.be.fulfilled.notify(done);
      });

      it('should allow to register a single item', function(done) {
        compiler.register('domain', {
          id: '1'
        })
          .should.be.fulfilled
          .then(function(result) {
            expect(result).to.be.an('object');
          })
          .should.notify(done);
      });

      it('should emit a debug event when the item has been registered', function(done) {
        compiler.register('domain', {
          id: '1'
        })
          .should.be.fulfilled
          .then(function() {
            expect(stubEvents.callCount).to.be.above(0);
            expect(stubEvents.calledWith('debug', 'phrases:registered')).to.equals(true);
          })
          .should.be.fulfilled.notify(done);
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

      describe('Phases failing', function() {
        var stubEvents, aCompiler;

        beforeEach(function() {
          aCompiler = new CodeCompiler({
            item: '__myList',
            itemName: 'testObject',
            validator: function(item) {
              if (item.id === 'invalid') {
                return q.reject();
              } else {
                return q.resolve(item);
              }
            }
          });
          stubEvents = sinon.stub();

          aCompiler.events = {
            emit: stubEvents
          };
        });

        describe('Validation fail', function() {

          it('should emit an error when the registering fails because the validation fails', function(done) {
            aCompiler.register('domain', {
              id: 'invalid'
            })
              .should.be.fulfilled
              .then(function() {
                expect(stubEvents.callCount).to.be.above(0);
                expect(stubEvents.calledWith('warn', 'testObject:not:registered')).to.equals(true);
              })
              .should.be.fulfilled.notify(done);
          });

          it('should return not registered when the registering fails because the validation fails', function(done) {
            aCompiler.register('domain', {
              id: 'invalid'
            })
              .should.be.fulfilled
              .then(function(result) {
                expect(result.registered).to.equals(false);
              })
              .should.be.fulfilled.notify(done);
          });

        });

        describe('Compilation fail', function() {
          var stubCompile;

          beforeEach(function() {
            stubCompile = sinon.stub(aCompiler, 'compile', function() {
              return false;
            });
          });

          afterEach(function() {
            stubCompile.restore();
          });

          it('should emit an error when the registering fails because the compilation fails', function(done) {
            aCompiler.register('domain', {
              id: 'valid'
            })
              .then(function() {
                expect(stubEvents.callCount).to.be.above(0);
                expect(stubEvents.calledWith('warn', 'testObject:not:registered')).to.equals(true);
                done();
              });
          });

          it('should return the unregistered state when the compilation fails', function(done) {
            aCompiler.register('domain', {
              id: 'valid'
            })
              .should.be.fulfilled
              .then(function(result) {
                expect(result.registered).to.equals(false);
              })
              .should.notify(done);
          });
        });
      });
    });



    describe('Item reseting', function() {
      var compiler;

      beforeEach(function() {

        compiler = new CodeCompiler({
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

      var compiler = new CodeCompiler({
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

    describe('Items unregistration', function() {
        var spyUnregister, compiler, stubEvents;

        beforeEach(function() {
          compiler = new CodeCompiler({
            item: '__mything',
            itemName: 'goodies'
          });

          spyUnregister = sinon.spy(compiler, '_unregister');

          stubEvents = sinon.stub();
          //Mock the composr external methods
          compiler.events = {
            emit: stubEvents
          };

        });

        it('Should be able to receive a single item', function() {
          compiler.unregister('mydomain', 'testId');

          expect(spyUnregister.callCount).to.equals(1);
        });

        it('Should be emit info about the event', function() {
            compiler.unregister('mydomain', 'testId');

          expect(stubEvents.callCount).to.equals(1); expect(stubEvents.calledWith('debug', 'goodies:unregister:testId')).to.equals(true);
        });

      it('Should be able to receive an array', function() {
        compiler.unregister('mydomain', ['testId', 'testId', 'testId', 'testId', 'testId']);

        expect(spyUnregister.callCount).to.equals(5);
      });
    });

  describe('Register without domain', function() {
    var stubRegister, compiler;

    before(function() {
      compiler = new CodeCompiler({
        item: '__mything',
        itemName: 'goodies'
      });

      stubRegister = sinon.stub(compiler, 'register', utilsPromises.resolvedPromise);
    });

    it('Calls the register method with the domain', function(done) {
      var examplePhrases = [{
        'id': 'domainTest!phrase'
      }, {
        'id': 'domainTest!phrase2'
      }, {
        'id': 'domainTest!phrase3'
      }, {
        'id': 'domainTwo!phrase'
      }];

      compiler.registerWithoutDomain(examplePhrases)
        .then(function() {
          expect(stubRegister.callCount).to.equals(2);
          expect(stubRegister.calledWith('domainTest')).to.equals(true);
          expect(stubRegister.calledWith('domainTwo')).to.equals(true);
        })
        .should.notify(done);
    });

  });

});