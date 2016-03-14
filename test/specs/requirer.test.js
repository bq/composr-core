var composr = require('../../src/composr-core'),
  _ = require('lodash'),
  chai = require('chai'),
  sinon = require('sinon'),
  utils = require('../../src/lib/utils'),
  chaiAsPromised = require('chai-as-promised'),
  Requirer = require('../../src/lib/requirer'),
  expect = chai.expect,
  should = chai.should();

chai.use(chaiAsPromised);


describe('Requirer', function() {

  var snippets = [{
    name: 'TheSnippet1',
    version : '1.0.0',
    codehash: utils.encodeToBase64('var userModel = function(id){ this.id = id; }; exports(userModel);')
  }, {
    name: 'TheSnippet2',
    version : '1.0.0',
    codehash: utils.encodeToBase64('exports(1);')
  }, {
    name: 'TheSnippet3',
    version : '1.0.0',
    codehash: utils.encodeToBase64('exports("My test");')
  }, {
    name: 'TheSnippet4',
    version : '1.0.0',
    codehash: utils.encodeToBase64('exports(1);')
  }, {
    name: 'TheSnippet5',
    version : '1.0.0',
    codehash: utils.encodeToBase64('exports(1);')
  }, {
    name: 'TheSnippet6',
    version : '1.0.0',
    codehash: utils.encodeToBase64('exports(1);')
  }];

  before(function(done) {
    composr.config = composr.bindConfiguration({
      urlBase: 'http://internet.com'
    });

    composr.requirer.configure(composr.config);

    var snippetsDomainOne = _.take(snippets, 3);

    var snippetsDomainTwo = _.takeRight(snippets, 6);

    composr.Snippets.register('testDomain', snippetsDomainOne)
      .should.be.fulfilled
      .then(function() {
        return composr.Snippets.register('otherDomain', snippetsDomainTwo);
      })
      .should.be.fulfilled.notify(done);

  });

  it('Has the expected API', function() {
    expect(composr.requirer).to.respondTo('configure');
    expect(composr.requirer).to.respondTo('forDomain');
  });

  it('Can require all the allowed libraries', function() {
    var requirerMethod = composr.requirer.forDomain('testDomain');

    var ALLOWED_LIBRARIES = ['q', 'async', 'request', 'corbel-js', 'lodash', 'http', 'ComposrError', 'composrUtils'];

    var requiredLibraries = ALLOWED_LIBRARIES.map(function(lib) {
      return requirerMethod(lib);
    });

    requiredLibraries.forEach(function(lib) {
      expect(lib).to.exist;
    });
  });

  it('Can not require a non allowed library', function() {
    var requirerMethod = composr.requirer.forDomain('testDomain');

    var NON_ALLOWED_LIBRARIES = ['fs', 'fs-extra', 'mongoose'];

    var requiredLibraries = NON_ALLOWED_LIBRARIES.map(function(lib) {
      return requirerMethod(lib);
    });

    requiredLibraries.forEach(function(lib) {
      expect(lib).to.not.exist;
    });

  });

  it('corbel-js should have the getDriver method', function() {
    var requirerMethod = composr.requirer.forDomain('testDomain');
    var corbel = requirerMethod('corbel-js');
    expect(corbel).to.respondTo('getDriver');
  });

  it('corbel-js should have the generateDriver method', function() {
    var requirerMethod = composr.requirer.forDomain('testDomain');
    var corbel = requirerMethod('corbel-js');
    expect(corbel).to.respondTo('generateDriver');
  });

  it('requires lodash correctly', function() {
    var requirerMethod = composr.requirer.forDomain('testDomain');
    var _lodash = requirerMethod('lodash');
    expect(_lodash.map).to.be.a('function');
    expect(_lodash.chunk).to.be.a('function');
    expect(_lodash.flatten).to.be.a('function');
  });

  it('Can require its own snippets', function() {
    var requirerMethod = composr.requirer.forDomain('testDomain');
    var requirerMethodOtherDomain = composr.requirer.forDomain('otherDomain');

    var TheSnippet1 = requirerMethod('snippet-TheSnippet1');

    expect(TheSnippet1).to.exist;
    expect(TheSnippet1).to.be.a('function');


    var TheSnippet6 = requirerMethodOtherDomain('snippet-TheSnippet6');

    expect(TheSnippet6).to.exist;
    expect(TheSnippet6).to.be.a('number');
  });

  it('Can require its own snippets with function mode', function() {
    var requirerMethod = composr.requirer.forDomain('testDomain', true);
    var requirerMethodOtherDomain = composr.requirer.forDomain('otherDomain');

    var TheSnippet1 = requirerMethod('snippet-TheSnippet1');

    expect(TheSnippet1).to.exist;
    expect(TheSnippet1).to.be.a('function');

    var TheSnippet6 = requirerMethodOtherDomain('snippet-TheSnippet6');

    expect(TheSnippet6).to.exist;
    expect(TheSnippet6).to.be.a('number');
  });

  it('Returns the expected value', function() {
    var requirerMethod = composr.requirer.forDomain('testDomain');

    var TheSnippet3 = requirerMethod('snippet-TheSnippet3');

    expect(TheSnippet3).to.exist;
    expect(TheSnippet3).to.be.a('string');
    expect(TheSnippet3).to.be.equals('My test');
  });

  it('Can not request other domain snippets', function() {
    var requirerMethod = composr.requirer.forDomain('testDomain');

    var TheSnippet6 = requirerMethod('snippet-TheSnippet6');

    expect(TheSnippet6).to.be.a('null');
  });

  it('Returns null for empty parameter', function() {
    var requirerMethod = composr.requirer.forDomain('testDomain');

    var snippet = requirerMethod();

    expect(snippet).to.be.a('null');
  });

  it('Event is called when snippet is not found', function() {
    var requirerMethod = composr.requirer.forDomain('testDomain');
    var spyEvents = sinon.spy(composr.requirer.events, 'emit');
    var TheSnippet6 = requirerMethod('snippet-TheSnippet6');
    expect(spyEvents.calledWith('warn', 'The snippet with domain (testDomain) and name (TheSnippet6) is not found')).to.equals(true);
    expect(spyEvents.callCount).to.equals(1);
    expect(TheSnippet6).to.be.a('null');
  });

  describe('Function or VM mode require', function() {
    var requirer, stubEvents;

    beforeEach(function() {
      stubEvents = sinon.stub();

      requirer = new Requirer({
        events: {
          emit: stubEvents
        },
        Snippets: composr.Snippets
      });
    });

    it('Requires snippets in function mode', function() {
      var requirerMethod = requirer.forDomain('testDomain', true);

      var TheSnippet1 = requirerMethod('snippet-TheSnippet1');

      expect(TheSnippet1).to.exist;
      expect(TheSnippet1).to.be.a('function');
      expect(stubEvents.callCount).to.equals(1);
      expect(stubEvents.calledWith('debug', 'executing:TheSnippet1:functionmode')).to.equals(true);
    });

    it('Requires snippets in script mode', function() {
      var requirerMethod = requirer.forDomain('testDomain');

      var TheSnippet1 = requirerMethod('snippet-TheSnippet1');

      expect(TheSnippet1).to.exist;
      expect(TheSnippet1).to.be.a('function');
      expect(stubEvents.callCount).to.equals(1);
      expect(stubEvents.calledWith('debug', 'executing:TheSnippet1:scriptmode')).to.equals(true);
    });

  });

});