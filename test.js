var __ = require('./dist/iterate.js');

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