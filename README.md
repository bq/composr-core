#CompoSR Core
----

[![NPM Version][npm-badge]][npm-url]
[![Build Status][travis-badge]][travis-url]
[![Test Coverage][coverage-badge]][codeclimate-url]
[![Code Climate][codeclimate-badge]][codeclimate-url]
[![Dependency status](https://david-dm.org/bq/composr-core/status.png)](https://david-dm.org/bq/composr-core#info=dependencies&view=table)
[![Dev Dependency Status](https://david-dm.org/bq/composr-core/dev-status.png)](https://david-dm.org/bq/composr-core#info=devDependencies&view=table)

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)


> The core package for Corbel's Composr. [NPM page][npm-url]


# Usage

```
npm install --save composr-core
```

## Read:

[What are Phrases or Snippets?](https://github.com/bq/composr-core/wiki/Phrases)

## Setup for fetching remote data from Corbel

```javascript
var composr = require('composr-core');

var options = {
  credentials: {
    clientId: 'demo',
    clientSecret: 'demo',
    scopes: 'demo'
  },
  urlBase: 'https://remote-corbel.com',
  timeout: 3000
};

//Trigger the load of data from the "remote corbel"
composr.init(options)
  .then(function() {
    //Ready to go
  });
```

## Setup with local data

```javascript
var composr = require('composr-core');

//Register phrases (Returns a promise)
var phrasesLoaded = composr.Phrase.register(domain, phrases);

//Register snippets (Returns a promise)
var snippetsLoaded = composr.Snippet.register(domain, snippets);

Promise.all([phrasesLoaded, snippetsLoaded])
  .then(function(){
    //Ready to go
  });
```


## Suscribe to log events

```javascript
//Suscribe to core log events (Optional)
composr.events.on('debug', 'myProject', function(){
    console.log.apply(console, arguments);
});

composr.events.on('info', 'myProject', function(){
    console.info.apply(console, arguments);
});

composr.events.on('warn', 'myProject', function(){
    console.warn.apply(console, arguments);
});

composr.events.on('warn', 'myProject', function(){
    console.warn.apply(console, arguments);
});
```


# Phrases execution 

## Non "express-js" server or script

It will use internal "mocked" req, res, next objects 

```javascript
var path = '/user/1231/test';
var method = 'get'; //get, post, put, delete
var params = {
  timeout: 10000
};

var executionPromise = composr.Phrase.runByPath(domain, url, method, params);
```

## Tunneling "express-js" req, res, next

```javascript
var path = '/user/1231/test';
var method = 'get'; //get, post, put, delete
var params = {
  req: req,
  res: res,
  next: next,
  timeout: 10000
};

var executionPromise = composr.Phrase.runByPath(domain, url, method, params);
```


# Phrase parameters

## Using mocked handlers

You can send an object containing the request headers and other for the body.
Use `params` if you don't want to extract the params from the url or if you are using `composr.Phrase.runByID`

```javascript
var headers = {
  'Authorization' : 'Token'
};

var body = {
  'name' : 'test'
};

var params = {
  'user' : '123'
};

var query = {
  'foo' : 'bar'
};

var params = {
  headers,
  body,
  query,
  params
}
```

## Using express handlers 
Whoa, just execute your dinamics endpoints. 

*Disable express-js e-tag generation in order to avoid cache problems*

```javascript
var params = {
  req,
  res,
  next,
  server : 'express'
}
```

## Using restify handlers 

**Use restify `queryParser` module** in order to have access to the query parameters.

```javascript
var params = {
  req,
  res,
  next,
  server : 'restify'
}
```


## Injecting a custom corbel-js driver instance

```javascript
var params = {
  corbelDriver,
}
```

## Phrase execution timeout

```javascript
var params = {
  timeout: 10000 //miliseconds
}
```


## Other parameters

```javascript
var params = {
  domain,
  browser : true, //In case you are using the browserified bundle and want to debug the phrases in the browser (requires small hack)
}
```


# Express-js example

```javascript
router.all('*', function(req, res, next) {
  executePhrase(req.path, req, res, next);
});

function executePhrase(endpointPath, req, res, next) {
  var path = endpointPath.slice(1).split('/'),
    domain = path[0],
    phrasePath = path.slice(1).join('/');

  if (!domain || !phrasePath) {
    return next();
  }

  var method = req.method.toLowerCase();

  var params = {
    req: req,
    res: res,
    next: next,
    server : 'express',
    timeout: 10000 
  };

  composr.Phrase.runByPath(domain, phrasePath, method, params)
    .catch(function(err){
      res.status(404).send(new ComposrError('endpoint:not:found', 'Not found', 404));
    });
}
```



## Debugging phrases

When registering some phrase models, pass the url to the "code" file in order to allow `vm.Script` to find the reference:

```javascript
phraseModel.debug = {
  'get' : '/myAbsolute/path/phrase.code.js'
};

composr.Phrase.register(phraseModel);
```

Later on, from your project, you can launch `node-inspector` debug and add breackpoints in the `phrase.code.js` file.

# API

**composr.Phrase.validate**

**composr.Phrase.compile**

**composr.Phrase.register**

**composr.Phrase.unregister**

**composr.Phrase.runById**

**composr.Phrase.runByPath**

**composr.Phrase.getPhrases**

**composr.Phrase.getById**

**composr.Phrase.getByMatchingPath**

**composr.Snippet.validate**

**composr.Snippet.compile**

**composr.Snippet.register**

**composr.Snippet.unregister**

**composr.Snippet.runByName**

**composr.Snippet.getByName**

**composr.Snippet.getSnippets**




[npm-badge]: https://badge.fury.io/js/composr-core.svg
[npm-url]: https://www.npmjs.org/package/composr-core

[travis-badge]: https://travis-ci.org/bq/composr-core.svg
[travis-url]: https://travis-ci.org/bq/composr-core

[codeclimate-badge]: https://codeclimate.com/github/bq/composr-core/badges/gpa.svg
[codeclimate-url]: https://codeclimate.com/github/bq/composr-core

[coverage-badge]: https://codeclimate.com/github/bq/composr-core/badges/coverage.svg
