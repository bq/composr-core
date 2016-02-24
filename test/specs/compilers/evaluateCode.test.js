 describe('Code evaluation', function() {
    var manager, stubEvents, spyCodeOptimization;

    beforeEach(function() {
      manager = new BaseManager({
        itemName: 'test-object',

      });

      stubEvents = sinon.stub();

      spyCodeOptimization = sinon.spy(manager, '__codeOptimization');

      //Mock the composr external methods
      manager.events = {
        emit: stubEvents
      };
    });

    it('should evaluate a function', function() {
      var result = manager._evaluateCode('console.log(a);');
      expect(result.fn).to.be.a('function');
      expect(result.script).to.be.a('object');
      expect(result.error).to.equals(false);
      expect(spyCodeOptimization.callCount).to.equals(1);
    });

    it('launches an event with the evaluation', function() {
      var result = manager._evaluateCode('console.log(a);');
      expect(stubEvents.callCount).to.equals(1);
      expect(stubEvents.calledWith('debug', 'test-object:evaluatecode:good')).to.equals(true);
    });

    it('fails with a wrong code', function() {
      var result = manager._evaluateCode('};');
      expect(result.fn).to.equals(null);
      expect(result.error).to.not.equals(false);

      expect(stubEvents.callCount).to.equals(1);
      expect(stubEvents.calledWith('warn', 'test-object:evaluatecode:wrong_code')).to.equals(true);
    });

  });