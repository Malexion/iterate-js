var __ = require('./dist/iterate.js');

//console.log(__);

// Distinct Testing

// var intList = [ 1, 1, 2, 3, 3, 4 ];

// console.log(intList);
// console.log(__.distinct(intList));

// var intObj = { key1: 1, key2: 1, key3: 2, key4: 3, key5: 3, key6: 4 };

// console.log(intObj);
// console.log(__.distinct(intObj));

// Intersect Testing

// var intList2 = [ 1, 4, 5 ];
// var intObj2 = { key1: 2, key2: 3, key3: 20 };

// console.log(__.intersect(intList, intList2));
// console.log(__.intersect(intObj, intObj2));

// Type Testing

// console.log(__.is.number(9));
// console.log(__.is.number(0));
// console.log(__.is.nan(NaN));

// EventManager Test

// var events = new __.lib.EventManager();
// var func1 = function() { console.log('Function 1'); };
// var func2 = function() { console.log('Function 2'); };

// events.add('OnInit', func1);
// events.add('OnInit', func2);

// var complete = events.trigger('OnInit');

// events.remove('OnInit', func1);

// complete = events.trigger('OnInit');

// events.remove('OnInit', func2);

// complete = events.trigger('OnInit');

// PrivateStore Test

// var store = new __.lib.PrivateStore();

// var Shape = __.class(function(type) {
//     store.bind(this);
//     store.context(this, function(private) {
//         private.type = type;
//         private.info = { points: 0 };
//     });
// }, {
// 	type: { 
// 		get: function() { 
// 			return store.get(this, 'type'); 
// 		}, 
// 		set: function(value) { 
// 			return store.set(this, 'type', value); 
// 		} 
// 	},
// 	points: {
// 		get: function() { 
// 			return store.get(this, 'info.points'); 
// 		}, 
// 		set: function(value) { 
// 			return store.set(this, 'info.points', value); 
// 		} 
// 	}
// });

// var s1 = new Shape('triangle');
// var s2 = new Shape('square');

// console.log(s1);
// console.log(s2);

// console.log(s1.type);
// console.log(s2.type);

// s2.type = 'Circle';

// console.log(s1.type);
// console.log(s2.type);

// console.log(s1.points);
// console.log(s2.points);

// s1.points = 3;

// console.log(s1.points);
// console.log(s2.points);

// console.log('Match Test');

// console.log(__.match({}, []));
// console.log(__.match([ 2, 3, 4 ], [ "2", "3", "4" ]));
// console.log(__.match([ 2, 3, 4 ], [ "2", "3", "4" ], { explicit: true }));
// console.log(__.match({ array: [ 2, 3, 4 ] }, { array: [ "2", "3", "4" ] }));
// console.log(__.match({ array: [ 2, 3, 4 ] }, { array: [ "2", "3", "4" ] }, { explicit: true }));

// console.log('Stopwatch Test');

// var watch = new __.lib.StopWatch();
// console.log(watch)

// console.log('Enumerable Test');

// var enumerable = new __.lib.Enumerable();
// enumerable.fish = 'stix';

// console.log(enumerable.getKeys);

// console.log('Config Test');
// console.log();

// var config = new __.lib.Config({
// 	prop1: 1,
// 	prop2: new __.lib.Config({
// 		sample1: 1,
// 		sample2: 2
// 	}),
// 	prop3: {
// 		sample4: 320,
// 		sample5: 333
// 	}
// });

// console.log(config);
// console.log();
// config.update({ prop2: { sample1: 4 }, prop3: 'fish' });
// console.log(config);

// console.log('Style Parser Test');

// var style = new __.lib.StyleParser('height: 100px; width: 500px;');

// console.log(style);
// console.log(style.toString());
// console.log(style.toJson());

// console.log('List Test');
// console.log();

// var list = new __.lib.List();

// list.add('phrase');
// list.addRange([ 'fish', 'long way', 'hollow', 'park' ]);

// list.remove('fish');
// list.removeRange(1, 2);

// list.insert(0, 'cheese');
// list.insertRange(3, [ 'stop', 'drop', 'roll' ]);

// console.log(list.getKeys);
// console.log(list.getValues);
// console.log(list.count);

// console.log('Dictionary Test');

// var dict = new __.lib.Dictionary();

// dict.add('sample', { value: 1 });
// dict.add('hostile', { value: 24 });
// dict.remove('sample');

// console.log(dict.count);
// console.log(dict.getKeys);
// console.log(dict.getValues);
// __.all(dict, (x, y) => console.log(y));

// console.log('Class Test');
// console.log();

// var Shape = __.class(function() {
// 	this.type = 'Shape';
// }, {
// 	getType: function() { return this.type; }
// });

// var a = new Shape();

// var Square = __.class(function(value) {
// 	Shape.call(this); // constructor call add params like.... Shape.call(this, param1, param2, param3...);
// 	this.type = 'Square';
// 	this.value = value;
// }, {
// 	setType: function(type) { this.type = type; },
// 	getValue: function() { return this.value; }
// }, Shape); // Inherits shape

// var b = new Square(2346);

// __.all(a, (x, y) => console.log(y), true);
// console.log();
// __.all(b, (x, y) => console.log(y), true);
// console.log();
// console.log(a.getType());
// console.log(b.getType());
// b.setType('Shape');
// console.log(b.getType());
// console.log(b.getValue());
