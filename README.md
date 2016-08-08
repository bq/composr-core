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

## Standalone execution

It will use internal "mocked" req, res, next objects 

```javascript
var path = '/user/1231/test';
var method = 'get'; //get, post, put, delete
var params = {
  timeout: 10000
};

composr.Phrase.runByPath(domain, url, method, params, function(err, response){
   //if err, phrase missing
   //response.status, response.body
  });
```

## Tunneling "restify" req, res, next

```javascript
var path = '/user/1231/test';
var method = 'get'; //get, post, put, delete
var params = {
  req: req,
  res: res,
  timeout: 10000
};

composr.Phrase.runByPath(domain, url, method, params, function(err, response){
   //if err, phrase missing
   //response.status, response.body
  });
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

## Using restify handlers 
Whoa, just execute your dinamics endpoints. 

```javascript
var params = {
  req,
  res,
  next
}
```

## Injecting a custom corbel-js driver instance

```javascript
var params = {
  corbelDriver
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
  functionMode : false, //In case you want to execute phrases inside vm contexts (memory intensive)
}
```


# Restify example

```javascript
router.get('/user/me', function(req, res, next) {
  var params = {
    req: req,
    res: res,
    next: next,
    timeout: 10000 
  };

  var uid = req.get('User-ID')//for example

  composr.Phrase.runByPath(domain, 'userdetail/' + uid, 'get', params, 
    function(err, response){
      //Executed and already sent to client.
    });
});
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
