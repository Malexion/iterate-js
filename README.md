# iterate-js

## Description

Adds onto the iterate-js-lite base model, methods: download, flow and the __.render.[...] section, along with many new built in classes. 

Mostly experimental functions/classes ill suited for lite will stay in here.

## Installation

Install package with NPM and add it to your development dependencies:

`npm install iterate-js`

Around 14kb + 11kb from inheriting iterate-js-lite, uglified and minified.

## Usage

```javascript
var __ = require('iterate-js');

// Iterate over everything
__.all([ 'hello', 'world' ], function(x) { console.log(x); });
__.all({ 'hello': 1, 'world': 2 }, function(x, y) { console.log(y); });

// Map array or objects
console.log(__.map([ 'hello', 'world' ], function(x) { return x; }));
// Map array or object to either or
console.log(__.map([ 'hello', 'world' ], function(x, y, z) { return { key: y, value: x }; }, { build: {} })); 

// Evaluate anything
console.log(__.is.string({}));
console.log(__.is.number(''));
console.log(__.is.def(null)); // Boolean eval
console.log(__.is.set(0)); // Check for null, undefined and NaN
console.log(__.flow([]).def().getProperty('length').def().result); // [].length is defined

// And more
__.all(__, function(x, y) { console.log(y); });
```

## String
Includes all iterate-js-lite string modifications.


## Functions
Includes all functions from iterate-js-lite plus:

- `__.flow(object)`

Chainable operations


## Classes

- `new __.lib.ConditionChain()`
  
  Object spawned by __.flow() for chaining conditions/operations onto an object.

- `new __.lib.StringParser()`

  Base framework for a string parser. An example parser is shown below.

  ```javascript
  var target = '(this and that)',
    build = [];

  var parser = new __.lib.StringParser({
    '(': function(char, idx, fullString, event) {
      build.push('');
    },
    ')': function() {
      console.log(build); // we are done print it out
    },
    ' ': function() {
      // ignore space characters
    },
    'and': function(phrase, idx, fullString, event) {
      build.push('[{0}]'.format(phrase));
      build.push('');
    }
  }, {
    defaultAction: function(char, idx, fullString, event) {
      build[build.length - 1] += char;
    }
  });

  parser.parse(target);
  ```

- `new __.lib.StyleParser()`

  Can parse css styles to json and back to string or vise versa.

- `new __.lib.AttrParser()`

  Can parse attrbutes to json and back to string or vise versa.

- `new __.lib.Overwrite()`

  Payload delivery for __.fuse() while deep copying to overwrite an array or object despite the deep iterate flag.

- `new __.lib.Config()`

  Config manager, with update functionality and update handler hooks.

- `new __.lib.EventManager()`

  Simple event manager, add/remove/trigger/delegate. Event names are stored as lowercase and each event can have multiple hooks into it.

- `new __.lib.ViewManager()`

  Simple view manager, useful for aurelia tabbed controls or simply controlling and handling different views.

- `new __.lib.StopWatch()`

  Event based stopwatch, with start, stop, reset and a configurable tick time as well as an ontick event.

- `new __.lib.Enumerable()`

  Base class for filling missing .keys() and .values() functionality.

- `new __.lib.List()`

  Inherits Enumerable, considerably more inefficient than an array but a crazy attempt at a fully javascript version.

- `new __.lib.Dictionary()`

  Inherits Enumerable, basic object map with syntactic sugar.

- `new __.lib.PrivateStore()`

  Wrapper for weakmap with easy access points for your classes, see below.

  ```javascript
  var store = new __.lib.PrivateStore();

  var Shape = __.class(function(type) {
      store.bind(this); // bind to init store for new class
      store.context(this, function(private) { // access all privates with store.context
          private.type = type;
          private.info = { points: 0 };
      });
  }, {
    type: { 
      get: function() { 
        return store.get(this, 'type'); // Easy getter will follow the path chain to your property
      }, 
      set: function(value) { 
        return store.set(this, 'type', value); // Easy setter will follow the path chain to set your property and init empty objects along the way if it has to
      } 
    },
    points: {
      get: function() { 
        return store.get(this, 'info.points'); 
      }, 
      set: function(value) { 
        return store.set(this, 'info.points', value); 
      } 
    }
  });
  ```