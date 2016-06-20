"use strict";
// Prototype Modification
String.prototype.replaceAll = function (str1, str2, ignore) {
    return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g, "\\$&"), (ignore ? "gi" : "g")), (typeof (str2) == "string") ? str2.replace(/\$/g, "$$$$") : str2);
};
String.prototype.replaceWhile = function (str1, str2, condition, ignoreCase) {
    var result = this.replaceAll(str1, str2, ignoreCase);
    var limit = 10000;
    while (condition(result) && (limit--))
        result = result.replaceAll(str1, str2, ignoreCase);
    return result;
};
String.prototype.format = function () {
    var content = this;
    for (var i = 0; i < arguments.length; i++) {
        //var replacement = '{' + i + '}';
        var regEx = new RegExp('\\{' + i + '\\}', 'gi');
        content = content.replace(regEx, arguments[i]);
    }
    return content;
};
String.prototype.contains = function (value, ignoreCase) {
    if (ignoreCase)
        return this.toLowerCase().indexOf(value.toLowerCase()) > -1;
    return this.indexOf(value) > -1;
};
String.prototype.whiteout = function (items) {
    var self = this;
    if (items) {
        var temp = self.slice(0);
        if (__.is.array(items))
            __.all(items, (v) => { temp = temp.replace(v, ''); });
        else if (__.is.string(items))
            temp = temp.replace(items, '');
        return temp.trim();
    }
    return this;
};
String.prototype.capitalize = function () {
    return this.replace(/[^\s]+/g, function (word) {
        return word.replace(/^./, function (first) {
            return first.toUpperCase();
        });
    });
};
String.prototype.firstWord = function () {
    var index = this.indexOf(' ');
    if (index > -1)
        return this.substring(0, index);
    return this;
};

var __ = new (function () {
    var map = new WeakMap();
    var me = this;
    // Constant Containers
    me.i = new (function () {
        this.obj = {};
        this.array = [];
        this.function = () => { };
        this.string = "ABC";
        this.integer = 1;
        this.bool = true;
        this.date = new Date();
        this.args = arguments;
        this.null = null;
        this.undefined = undefined;
        this.nan = NaN;
        this.setConditions = (object) => { return (object != null && object != undefined && object != NaN); };
        this.defaultConditions = (object) => { return Boolean(object); };
        this.formatOptions = () => { return { value: 0, decimal: 2, digits: -1, dynamic: false, form: '{0}', delim: '', type: '' }; };
    })();
    me.formats = new (function () {
        this.padleft = (params) => {
            var temp = params.value.toString();
            if (temp.length < params.places)
                return me.formats.padleft({ value: params.delim + temp, places: params.places, delim: params.delim });
            else
                return temp;
        };
    })();
    me.guidMap = {};

    // Base Functions
    me.all = (obj, func, all) => {
        /// <summary>Iterates over any interable object, arrays, objects, arguments and more.</summary>
        /// <param type="Iterable" name="obj">The item to iterate over, works on objects, arrays, argumates and anything that can iterate.</param>
        /// <param type="Function" name="func">The function called each iteration, passed (value, key, event).</param>
        /// <param type="Bool(Optional)" name="all">The optional bool to toggle off the hasOwnProperty check, note that it will still work on arrays and arguments regardless.</param>
        var event = { stop: false };
        var getAll = (all === true);
        for (var val in obj) {
            if (all || obj.hasOwnProperty(val))
                func(obj[val], val, event);
            if (event.stop)
                break;
        }
    };
    me.call = (obj, args, methodChain) => {
        /// <summary>Iterates over an iterable and attempts to call a function at the end of the resulting method chain for each iteration. Ex: Calls every function in an array of functions.</summary>
        /// <param type="Iterable" name="obj">The item to iterate over, works on objects, arrays, argumates and anything that can iterate.</param>
        /// <param type="Arguments(Optional)" name="args">Arguments passed into the recieving functions.</param>
        /// <param type="String(Optional)" name="methodChain">String based path to the object property. Ex: { item: { type: 1 } } with 'item' it will find { type: 1 } with 'item.type' it will find 1.</param>
        me.all(obj, (v) => {
            var prop = me.prop(v, methodChain);
            if (__.is.function(prop))
                prop(args);
        });
    };
    me.class = (construct, methods, inherit) => {
        var customFuse = (target, properties) => {
            me.all(properties, (x, y) => {
                if(me.is.function(x))
                    target[y] = x;
                else if(me.is.object(x)) { // Allows user to set getters/setters
                    Object.defineProperty(target, y, me.fuse({
                        get: function() { return null; },
                        set: function(value) {  },
                        enumerable: false,
                        configurable: true
                    }, x));
                }
            }, true);
        };
        if (inherit) {
            var proto = methods;
            if (me.is.array(inherit))
                me.all(inherit, (x) => { proto = customFuse(Object.create(x.prototype), proto); });
            else
                proto = customFuse(Object.create(inherit.prototype), proto);
            construct.prototype = proto;
        } else
            construct.prototype = customFuse({}, methods);
        construct.prototype.constructor = construct;
        return construct;
    };
    me.contains = (obj, func) => {
        /// <summary>Attempts to search the first param for the result in the most optimized fashion as the following pairs show: 
        /// (string, string), (string, function), (array, function), (array, value), (object, function), (object, value).</summary>
        /// <param type="Value" name="obj">Item to search based on the second params conditions.</param>
        /// <param type="String/Function/Value" name="func">String fragment, Function passed (value, key) need to return true/false, or raw value to search for.</param>
        /// <returns type="Bool">If the resulting conditions are met it will return true, otherwise false.</returns>
        var retVal = false;
        if (__.is.string(obj)) {
            if (me.is.function(func))
                retVal = (obj.contains(func(obj)));
            else
                retVal = (obj.contains(func));
        } else
            retVal = (me.is.def(me.search(obj, func)));
        return retVal;
    };
    me.count = (obj, func) => {
        /// <summary>Iterates over an iterable attempting to count the objects based on the returned value.</summary>
        /// <param type="Iterable" name="obj">The item to iterate over, works on objects, arrays, argumates and anything that can iterate.</param>
        /// <param type="Function(Optional)" name="func">Function to get you to the value you want to count, must return that value, if it is null, undefined or NaN it will not count the value.</param>
        /// <returns type="Integer">The total count of the values searched.</returns>
        var count = 0,
            key = (me.is.function(func)) ? func : (v, k) => { return v; };
        me.all(obj, (v, k) => {
            if (me.is.set(key(v, k)))
                count++;
        });
        return count;
    };
    me.data = (binding, action, value) => {
        if (action == 'get')
            return map.get(binding);
        else if (action == 'set')
            map.set(binding, value);
    };
    me.debounce = (func, time) => {
        time || (time = 250);
        var timer = null;
        return () => {
            var context = this,
                args = arguments;
            clearTimeout(timer);
            timer = setTimeout(() => {
                func.apply(context, args);
            }, time);
        };
    };
    me.download = (content, fileName, type) => {
        /// <summary>Downloads a file from an array of strings given a name and type.</summary>
        /// <param type="Array" name="content">Array of strings joined together for the files content.</param>
        /// <param type="String" name="fileName">Name of the file without the extension which is added on by the third param.</param>
        /// <param type="String" name="type">File type, only current choice is 'csv'.</param>
        var fileMap = {
            'csv': { ext: '.csv', encoding: 'data:application/csv;charset=utf-8' },
        };
        var fileType = fileMap[type.toLowerCase()];
        var data = (Array.isArray(content)) ? content.join('') : content;
        if (window.navigator.userAgent.indexOf("MSIE ") > -1 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) {
            var IEwindow = window.open('', '_blank');
            IEwindow.document.open("text/csv", "replace");
            IEwindow.document.write(data);
            IEwindow.document.close();
            IEwindow.document.execCommand('SaveAs', true, fileName + fileType.ext);
            IEwindow.close();
        } else {
            var uri = fileType.encoding + ',' + encodeURIComponent(data);
            var link = document.createElement("a");
            link.href = uri;
            link.style = "visibility:hidden";
            link.download = fileName + fileType.ext;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };
    me.flow = (obj) => {
        /// <summary> Returns a ConditionChain object with additional function and operations based on the type of object passed in.</summary>
        /// <param type="Value" name="obj">Value to be checked and evaluated.</param>
        /// <returns type="ConditionChain">A chain object, which contains many different functions, to get the boolean result simply call [chain].result. For more see the ConditionChain class.</returns>

        return new ConditionChain(obj);
    };
    me.first = (obj, key, n) => {
        /// <summary>Attempts to iterate over the iterable object and get the first object, if key is true then it will return the first objects key, 
        /// if n greater than 1 or defined it will return that number of objects.</summary>
        /// <param type="Iterable" name="obj">The item to iterate over, works on objects, arrays, argumates and anything that can iterate.</param>
        /// <param type="Bool(Optional)" name="key">If true returns the key of the first iteration, if not defined it will return the value.</param>
        /// <param type="Integer(Optional)" name="n">If set, will return n number of items from the front of the iterable.</param>
        /// <returns type="Value">First n number of objects found, if many it will return an array, if one than it will return the first item.</returns>
        var retVal = null,
            count = 1;
        if (n && n > 1) {
            if (me.is.array(obj)) {
                retVal = [];
                me.all(obj, (v, k, e) => {
                    if (count > n)
                        e.stop = true;
                    count++;
                    if (key)
                        retVal.push(k);
                    else
                        retVal.push(v);
                });
            } else {
                retVal = {};
                me.all(obj, (v, k, e) => {
                    if (count > n)
                        e.stop = true;
                    retVal[k] = v;
                    count++;
                });
            }
        } else {
            me.all(obj, (v, k, e) => {
                e.stop = true;
                if (key)
                    retVal = k;
                else
                    retVal = v;
            });
        }
        return retVal;
    };
    me.filter = (obj, func) => {
        /// <summary>Iterates over an object or array and will filter it down and return the respective filtered object or array.</summary>
        /// <param type="Iterable" name="obj">The item to iterate over, works on objects, arrays, argumates and anything that can iterate.</param>
        /// <param type="Function" name="func">Function passed (value, key, event) needs to return true or falsed, if true the the item is accepted, if false excluded.
        /// If you set event.stop = true; at any time it will cancel the loop and return whatever it has generated thus far.</param>
        /// <returns type="Object/Array">The respective object or array generated.</returns>
        var event = { stop: false };
        var ret = null;
        if (me.is.function(func)) {
            if (me.is.array(obj)) {
                ret = [];
                me.all(obj, (x, y, e) => {
                    if (func(x, y, event))
                        ret.push(x);
                    if (event.stop)
                        e.stop = true;
                });
            } else if (me.is.object(obj)) {
                ret = {};
                me.all(obj, (x, y, e) => {
                    if (func(x, y, event))
                        ret[y] = x;
                    if (event.stop)
                        e.stop = true;
                });
            }
        } else if (me.is.object(func)) {
            var flag = null;
            ret = me.filter(obj, (v) => {
                flag = true;
                me.all(req, (value, prop) => {
                    if (v[prop] != value)
                        flag = false;
                });
                return flag;
            });
        }
        return ret;
    };
    me.format = (params) => {
        /// <summary>Attempts to format the params passed in given a type property within params.</summary>
        /// <param type="Object" name="params">Object parameters passed in, see i.formatOptions for full view of replaceable params.</param>
        /// <returns type="String">Formatted value.</returns>
        var options = __.flow(params).def().update(me.i.formatOptions()).value(); // Types: N, S
        var temp = me.formats[options.type.toLowerCase()];
        var retVal = '';
        if (__.is.function(temp))
            retVal = temp(options);
        else
            retVal = options.value;
        return retVal;
    };
    me.fuse = (obj1, obj2, deep, all) => {
        /// <summary>Fuses the second parameter object into the first overriding its properties and creating new ones where necessary. 
        /// Has detection for Config and Override Objects, allowing layering.</summary>
        /// <param type="Object" name="obj1">Base Object to be overwritten.</param>
        /// <param type="Object" name="obj2">Object that will overwrite.</param>
        /// <param type="Bool(Optional)" name="deep">If true fuse will enter deep copy mode and recursively iterate through arrays and objects. 
        /// There is no recursive limit so be careful about object loops.</param>
        /// <returns type="Object">Returns obj1 after the resulting merge with obj2.</returns>
        var deepMode = (deep != undefined && deep == true);
        me.all(obj2, (object, key, all) => {
            if (me.is.object(object) && (obj1[key] != null && obj1[key] != undefined) && obj1[key].identifier == 'Config Object')
                obj1[key].update(object, true);
            else if (me.is.object(object) && object.identifier == 'Replace Object')
                obj1[key] = object.content();
            else {
                if (deepMode && (me.is.object(object) || me.is.array(object))) {
                    if (obj1[key] == null && obj1[key] == undefined) {
                        if (me.is.object(object))
                            obj1[key] = {};
                        else if (me.is.array(object))
                            obj1[key] = [];
                    }
                    me.fuse(obj1[key], object, true);
                }
                else
                    obj1[key] = object;
            }
        });
        return obj1;
    };
    me.getType = (obj) => {
        /// <summary>Gets the type of object in string form.</summary>
        /// <param type="Value" name="obj">Object to get the type of.</param>
        /// <returns type="String">Returns the string portion containing the object identifier. Ex: 'object', 'array', 'string', 'boolean'...</returns>
        return me.i.obj.toString.call(obj).match(/\s([a-zA-Z]+)/)[1];
    };
    me.group = (obj, func) => {
        /// <summary>Groups up values given a function or string to get to the respective property, if nothing it will group by raw values.</summary>
        /// <param type="Iterable" name="obj">The item to iterate over, works on objects, arrays, argumates and anything that can iterate.</param>
        /// <param type="Function/String(Optional)" name="func">Function or string property chain that will attempt to get to the value of the object, 
        /// if undefined it will just return the iterated object.</param>
        /// <returns type="Object">Returns an object with properties defining the groups and objects that match in arrays within those groups.</returns>
        var key = (me.is.function(func)) ? func : (v) => { return me.prop(v, func); },
            retVal = {},
            value = null;
        me.all(obj, (v) => {
            value = key(v);
            if (me.flow(value).set().eval(x => (me.is.string(x.value) || me.is.numeric(x.value))).result) {
                me.flow(retVal[value]).set()
                    .isTrue(() => { retVal[value].push(v); })
                    .isFalse(() => { retVal[value] = [v]; });
            }
        });
        return retVal;
    };
    me.guid = (seperator, track) => {
        /// <summary>Attempts to create a unique guid using random generators. Warning this guid is not tracked so there is a very very small chance it could be generated twice.</summary>
        /// <param type="String(Optional)" name="seperator">Optional parameter to set the seperator between random strings. Default is '-'.</param>
        /// <returns type="String">Returns a guid string.</returns>
        var sep = (me.i.setConditions(seperator)) ? seperator : '-';
        var guid = me.math.r16() + me.math.r16() + sep + me.math.r16() + sep + me.math.r16() + sep + me.math.r16() + sep + me.math.r16() + me.math.r16() + me.math.r16();
        if (track) {
            if (me.guidMap[guid])
                return me.guid(seperator, track);
            else
                me.guidMap[guid] = true;
        }
        return guid;
    };
    me.last = (obj, key, n) => {
        /// <summary>Attempts to iterate over the iterable object and get the last object, if key is true then it will return the last objects key, 
        /// if n greater than 1 or defined it will return that number of objects or an object with that number of properties.</summary>
        /// <param type="Iterable" name="obj">The item to iterate over, works on objects, arrays, argumates and anything that can iterate.</param>
        /// <param type="Bool(Optional)" name="key">If true returns the key of the last iteration, if not defined it will return the value.</param>
        /// <param type="Integer(Optional)" name="n">If set, will return n number of items from the front of the iterable.</param>
        /// <returns type="Value">Last n number of objects found, if many it will return an array, if one than it will return the last item.</returns>
        var retVal = null,
            count = 1,
            process = [];
        if (me.is.array(obj)) {
            if (n && n > 1) {
                retVal = [];
                process = obj.reverse();
                me.all(process, (v, k, e) => {
                    if (count > n)
                        e.stop = true;
                    count++;
                    if (key)
                        retVal.push(k);
                    else
                        retVal.push(v);
                });
            } else {
                me.all(process, (v, k, e) => {
                    e.stop = true;
                    count++;
                    if (key)
                        retVal = k;
                    else
                        retVal = v;
                });
            }
        } else {
            me.all(obj, (v, k, e) => { process.push(k); });
            process.reverse();
            if (n && n > 1) {
                retVal = {};
                me.all(process, (v, k, e) => {
                    if (count > n)
                        e.stop = true;
                    retVal[v] = obj[v];
                    count++;
                });
            } else {
                me.all(process, (v, k, e) => {
                    e.stop = true;
                    if (key)
                        retVal = v;
                    else
                        retVal = obj[v];
                    count++;
                });
            }
        }
        return retVal;
    };
    me.map = (obj, func, e) => {
        /// <summary>Attempts to map the respective array or object to an array or object given the event parameter you can change the build object to an object, default is building an array. 
        /// Ex: __.map([...], (v, k) => ({ value: v, key: k }), { build: {} }); will map an array to an object.</summary>
        /// <param type="Iterable" name="obj">The item to iterate over, works on objects, arrays, argumates and anything that can iterate.</param>
        /// <param type="Function" name="func">Function passed (value, key, event) needs to return something to be shoved into the map. 
        /// If it returns nothing than the map fills with undefined.</param>
        /// <param type="Object(Optional)" name="e">Event param for loop customization like pushing multiple into the return object at once or skipping the current iteration or stopping the loop.</param>
        /// <returns type="Array/Object">Returns the mapped array or object.</returns>
        var event = me.flow(e).def().update({ stop: false, skip: false, pushMultiple: false, build: [] }).value();
        var ret = event.build;
        var isArray = me.is.array(ret);
        var isObject = me.is.object(ret);
        var key = (me.is.function(func)) ? func : (v) => { return v; };
        var add = (value) => {
            if (isArray)
                ret.push(value);
            else if (isObject)
                ret[value.key] = value.value;
        };
        me.all(obj, (x, y, e) => {
            var value = key(x, y, event);
            if (event.skip)
                event.skip = false;
            else {
                if (event.pushMultiple) {
                    me.all(value, v => add(v));
                    event.pushMultiple = false;
                } else
                    add(value);
            }
            if (event.stop)
                e.stop = true;
        });
        return ret;
    };
    me.move = (obj, key1, key2) => {
        /// <summary>Attempts to move key value pair to target key value pair, uses internal methods on array objects.</summary>
        /// <param type="Array/Object" name="obj">The Object/Array which contains the key1 to be moved to key2.</param>
        /// <param type="String/Int" name="key1">The source key of the property to be moved.</param>
        /// <param type="String/Int" name="key2">The target key of the property to be moved.</param>
        /// <returns type="Array/Object">Returns the array or object passed in.</returns>
        if (me.is.array(obj))
            obj.splice(key2, 0, obj.splice(key1, 1)[0]);
        else {
            obj[key2] = obj[key1];
            delete obj[key1];
        }
        return obj;
    };
    me.prop = (obj, path) => {
        /// <summary>Searches an object using a property path and returns the resulting value.</summary>
        /// <param type="Object" name="obj">The item to be searched along the path chain.</param>
        /// <param type="String(Optional)" name="path">String based path to the object property. Ex: { item: { type: 1 } } with 'item' it will find { type: 1 } with 'item.type' it will find 1.</param>
        /// <returns type="Value">Value of the resulting property chain, will be undefined if the value at the end isn't there, or if the chain is cut short.</returns>
        if (path) {
            var current = obj,
                paths = path.split('.');
            me.all(paths, (p, i, e) => {
                current = current[p];
                if (!me.is.set(current))
                    e.stop = true;
            });
            return current;
        } else
            return obj;
    };
    me.rank = (obj, func) => {
        /// <summary>Requires sorted array and will use a key in an attempt to rank the values.</summary>
        /// <param type="Array" name="obj">Array of sorted objects to be ranked.</param>
        /// <param type="Function(Optional)" name="options">Map function, default is to return the raw value.</param>
        /// <returns type="Array">Array of rankings by index.</returns>
        var sorted = [],
            key = (func) ? func : v => v;
        sorted = me.map(obj, key);
        return me.map(obj.slice(), (v) => {
            var idx = sorted.indexOf(v);
            return (idx == 0) ? idx + 1 : idx;
        });
    };
    me.remove = (obj, item) => {
        /// <summary>Attempts to remove the item from the object using which ever methods are most suited towards the object.</summary>
        /// <param type="Array/Object" name="obj">Object/Array from which to remove the item.</param>
        /// <param type="Object" name="item">Item to be removed, not the property name but the item itself.</param>
        /// <returns type="Array/Object">Returns the modified object.</returns>
        if (me.is.array(obj)) {
            var idx = obj.indexOf(item);
            if (idx > -1)
                obj.splice(idx, 1);
        } else if (me.is.object(obj)) {
            var key = me.search(obj, item, { getKey: true });
            delete obj[key];
        }
        return obj;
    };
    me.search = (obj, func, options) => {
        /// <summary>Attempts to search the first param for the result in the most optimized fashion as the following pairs show: 
        /// (array, function), (array, value), (object, function), (object, value).</summary>
        /// <param type="Value" name="obj">Item to search based on the second params conditions.</param>
        /// <param type="Function/Value" name="func">Function passed (value, key) need to return true/false, or raw value to search for.</param>
        /// <returns type="Value">If the resulting conditions are met it will return the value, otherwise null.</returns>
        var ret = null,
            opt = me.flow(options).set().update({ retval: null, all: false, getKey: false }).value();
        if (me.is.function(func)) {
            me.all(obj, (x, y, e) => {
                if (func(x, y)) {
                    if (opt.getKey)
                        ret = y;
                    else
                        ret = x;
                    e.stop = true;
                }
            }, opt.all);
        } else if (me.is.array(obj)) {
            var idx = obj.indexOf(func);
            if (idx > -1) {
                if (opt.getKey)
                    ret = idx;
                else
                    ret = obj[idx];
            }
        } else if (me.is.object(obj)) {
            me.all(obj, (x, y, e) => {
                if (x == func) {
                    if (opt.getKey)
                        ret = y;
                    else
                        ret = x;
                    e.stop = true;
                }
            }, opt.all);
        }
        return (ret == null) ? opt.retval : ret;
    };
    me.sort = (array, options) => {
        /// <summary>Sort an array of values given options { dir: 'asc', key: v => v } both are optional, with the first giving direction and the second getting 
        /// you to the value you are sorting upon.</summary>
        /// <param type="Array" name="array">The array of items to be sorted.</param>
        /// <param type="Object/Array(Optional)" name="options">The options shaping the sorting method. If it is an array it will sort on multiple options.</param>
        /// <returns type="Array"></returns>
        if (me.is.array(options)) {
            var o = me.map(options, x => me.flow(x).def().update({ dir: 'asc', key: v => v }).value());
            var rev, result, A, B;
            return array.slice().sort((a, b) => {
                me.all(o, (x, y, z) => {
                    rev = (o.dir == 'asc') ? true : false;
                    result = 0;
                    A = x.key(a);
                    B = x.key(b);

                    result = ((A < B) ? -1 : ((A > B) ? 1 : 0)) * [-1, 1][+!!rev];

                    if (result != 0)
                        z.stop = true;
                });
                return result;
            });
        } else {
            var o = me.flow(options).def().update({ dir: 'asc', key: v => v }).value();
            var rev = (o.dir == 'asc') ? true : false;
            return array.slice().sort((a, b) => {
                var A = o.key(a), B = o.key(b);
                return ((A < B) ? -1 : ((A > B) ? 1 : 0)) * [-1, 1][+!!rev];
            });
        }
    };
    me.switch = (value, hash, def) => {
        /// <summary>A simplified switch statement for returning values. Ex: __.switch(1, { 1: 'Hello', 2: 'World' }, 'Fail') == 'Hello'</summary>
        /// <param type="Value" name="value">Preferably a string or integer, it's compared with the keys of the hash to find a matching value.</param>
        /// <param type="Object" name="hash">Object hash where the keys are compared to the input value, if a match is found the keys corresponding value is returned.</param>
        /// <param type="Value" name="def">The default value returned if nothing else matches.</param>
        /// <returns type="Value">The value returned from the hash, or if no match is found the default is returned.</returns>
        var retval = hash[value];
        me.flow(retval).def()
            .isFalse(() => { retval = def; });
        if (me.is.function(retval))
            retval = retval(value);
        return retval;
    };
    me.throttle = (func, time) => {
        time || (time = 250);
        var last,
            timer;
        return () => {
            var context = this,
                now = +(new Date),
                args = arguments;

            if (last && now < last + time) {
                clearTimeout(timer);
                timer = setTimeout(() => {
                    last = now;
                    func.apply(context, args);
                }, time);
            } else {
                last = now;
                func.apply(context, args);
            }
        };
    };

    // Function Containers
    me.is = new (function () {
        this.def = (value) => {
            /// <summary>Checks the value against the defined conditions which converts it to a boolean with result = Boolean(value); which means it will fail on empty strings, zeros and more.</summary>
            /// <param type="Value" name="value">Value to be checked.</param>
            /// <returns type="ConditionChain">A chain object, which contains many different functions, to get the boolean result simply call [chain].result. For more see the ConditionChain class.</returns>
            var ret = me.i.defaultConditions(value);
            return ret;
        };
        this.set = (value) => {
            /// <summary>Checks the value against the set conditions which checks it against undefined, null and NaN.</summary>
            /// <param type="Value" name="value">Value to be checked.</param>
            /// <returns type="ConditionChain">A chain object, which contains many different functions, to get the boolean result simply call [chain].result. For more see the ConditionChain class.</returns>
            var ret = me.i.setConditions(value);
            return ret;
        };
        this.sameType = (var1, var2) => {
            return (me.getType(var1) == me.getType(var2));
        };
        this.function = (object) => {
            return me.is.sameType(object, me.i.function);
        };
        this.object = (object) => {
            return me.is.sameType(object, me.i.obj);
        };
        this.array = (object) => {
            return me.is.sameType(object, me.i.array);
        };
        this.args = (object) => {
            return me.is.sameType(object, me.i.args);
        };
        this.boolean = (object) => {
            return me.is.sameType(object, me.i.bool);
        };
        this.string = (object) => {
            return me.is.sameType(object, me.i.string);
        };
        this.numeric = (object) => {
            return me.is.sameType(object, me.i.integer);
        };
    })();
    me.math = new (function () {
        this.r16 = function () {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        };
        this.roundUpTo = function (value, step) {
            return Math.ceil(value / step) * step;
        };
        this.median = function (values, func) {
            var obj = values;
            if (func)
                obj = me.map(values, func);
            obj.sort(function (a, b) { return a - b; });
            var half = Math.floor(obj.length / 2);
            if (obj.length % 2)
                return obj[half];
            else
                return (obj[half - 1] + obj[half]) / 2.0;
        };
        this.sum = function (values, func) {
            var sum = 0;
            me.all(values, x => {
                if (func)
                    sum += func(x);
                else
                    sum += x;
            });
            return sum;
        };
        this.average = function (values, func) {
            var sum = me.math.sum(values, func);
            if (sum > 0 || sum < 0)
                return sum / values.length;
            return 0;
        };
        this.max = function (values, func) {
            if (values.length > 0) {
                var ret = values[0];
                for (var val in values) {
                    if (func == undefined) {
                        if (values[val] > ret)
                            ret = values[val];
                    }
                    else {
                        var temp = func(values[val]);
                        if (temp > ret)
                            ret = temp;
                    }
                }
                return ret;
            }
            return null;
        };
        this.min = function (values, func) {
            if (values.length > 0) {
                var ret = values[0];
                for (var val in values) {
                    if (func == undefined) {
                        if (values[val] < ret)
                            ret = values[val];
                    }
                    else {
                        var temp = func(values[val]);
                        if (temp < ret)
                            ret = temp;
                    }
                }
                return ret;
            }
            return null;
        };
        this.percentages = function (values, func) {
            var retVal = [];
            var total = me.math.sum(values, func);
            if (total != 0) {
                for (var val in values) {
                    var value = 0;
                    if (func == undefined)
                        value = values[val];
                    else
                        value = func(values[val]);
                    retVal.push(value / total);
                }
            }
            return retVal;
        };
    })();
    me.render = new (function () {
        this.blend = (c0, c1, p) => {
            /// <summary>Blends the second hex color into the first by a percentage</summary>
            /// <param type="String" name="c0">Primary Hex string to be blended. Ex: '#FFFFFF'</param>
            /// <param type="String" name="c1">Secondary Hex string to be blended into the first. Ex: '#000000'</param>
            /// <param type="Decimal" name="p">Percentage of the second hex to be blended into the first</param>
            /// <returns type="Hex String">Resulting hex string of the blend.</returns>
            var f = parseInt(c0.slice(1), 16), t = parseInt(c1.slice(1), 16), R1 = f >> 16, G1 = f >> 8 & 0x00FF, B1 = f & 0x0000FF, R2 = t >> 16, G2 = t >> 8 & 0x00FF, B2 = t & 0x0000FF;
            return "#" + (0x1000000 + (Math.round((R2 - R1) * p) + R1) * 0x10000 + (Math.round((G2 - G1) * p) + G1) * 0x100 + (Math.round((B2 - B1) * p) + B1)).toString(16).slice(1);
        };
        this.bytesToImageSrc = (bytes, type) => { // el.src = __.render.bytesToImage( [ byteArrayFromServer ].join('') );
            return "data:image/{0};base64,{1}".format((type) ? type : 'png', bytes);
        };
        this.bytesToCanvas = (bytes, type, canvas, coords) => {
            //var canvas = document.getElementById("myCanvas");
            var ctx = canvas.getContext("2d");

            var uInt8Array = bytes;
            var i = uInt8Array.length;
            var binaryString = [i];
            while (i--) {
                binaryString[i] = String.fromCharCode(uInt8Array[i]);
            }
            var data = binaryString.join('');

            var base64 = window.btoa(data);

            var img = new Image();
            img.src = "data:image/{0};base64,{1}".format((type) ? type : 'png', base64);
            img.onload = function () {
                console.log("Image Onload");
                ctx.drawImage(img, coords[0], coords[1], canvas.width, canvas.height);
            };
            img.onerror = function (stuff) {
                console.log("Img Onerror:", stuff);
            };
        };
    })();
})();

// [Testing] Chaining Conditions/Actions by a boolean evaluation
class ConditionChain {
    constructor(value) {
        var self = this;
        self.details = {
            initialValue: value,
            value: value,
            status: true,
            actions: []
        };

        var addAction = (type, method, result) => { self.details.actions.push({ type: type, result: result }); };
    }

    get result() {
        return this.details.status;
    }

    all(func) {
        var type = __.getType(this.details.value);
        if (type == __.getType(__.i.array) || type == __.getType(__.i.obj) || type == __.getType(__.i.args) || type == __.getType(__.i.string))
            __.all(this.details.value, func);
        return this;
    }

    append(value) {
        var type = __.getType(this.details.value);
        if (type == __.getType(__.i.array))
            this.details.value.push(value);
        else if (type == __.getType(__.i.string) && __.is.sameType(value, __.i.string))
            this.details.value += value;
        return this;
    }

    appendTo(value) {
        var type = __.getType(this.details.value);
        if (type == __.getType(__.i.array))
            this.details.value.unshift(value);
        else if (type == __.getType(__.i.string) && __.is.sameType(value, __.i.string))
            this.details.value = value + this.details.value;
        return this;
    }

    average(func) {
        if (__.is.sameType(this.details.value, __.i.array))
            this.details.value = __.math.average(this.details.value, func);
        return this;
    }

    call(args, chain) {
        var type = __.getType(this.details.value);
        if (type == __.getType(__.i.array) || type == __.getType(__.i.obj) || type == __.getType(__.i.args) || type == __.getType(__.i.string))
            __.call(this.details.value, args, chain);
        return this;
    }

    contains(func) {
        if (this.details.status) {
            var type = __.getType(this.details.value);
            if (type == __.getType(__.i.array) || type == __.getType(__.i.obj) || type == __.getType(__.i.args) || type == __.getType(__.i.string))
                this.details.value = __.contains(this.details.value, func);
        }
        return this;
    }

    count(func) {
        var type = __.getType(this.details.value);
        if (type == __.getType(__.i.array) || type == __.getType(__.i.obj) || type == __.getType(__.i.args) || type == __.getType(__.i.string))
            this.details.value = __.count(this.details.value);
        return this;
    }

    def() {
        if (this.details.status)
            this.details.status = __.i.defaultConditions(this.details.value);
        return this;
    }

    equals(value) {
        if (this.details.status)
            this.details.status = (this.details.value == value);
        return this;
    }

    equalsExplicit(value) {
        if (this.details.status)
            this.details.status = (this.details.value === value);
        return this;
    }

    evaluate(condition) {
        if (this.details.status)
            condition(this.details);
        return this;
    }

    filter(func) {
        var type = __.getType(this.details.value);
        if (type == __.getType(__.i.array) || type == __.getType(__.i.obj))
            this.details.value = __.filter(this.details.value, func);
        return this;
    }

    first(func, n) {
        var type = __.getType(this.details.value);
        if (type == __.getType(__.i.array) || type == __.getType(__.i.obj))
            this.details.value = __.first(this.details.value, func, n);
        return this;
    }

    getProperty(propChain) {
        this.details.value = __.prop(this.details.value, propChain);
        return this;
    }

    group(func) {
        var type = __.getType(this.details.value);
        if (type == __.getType(__.i.array) || type == __.getType(__.i.obj))
            this.details.value = __.group(this.details.value, func);
        return this;
    }

    isTrue(func) {
        if (this.details.status)
            func(this.details);
        return this;
    }

    isFalse(func) {
        if (!this.details.status)
            func(this.details);
        return this;
    }

    isSameType(type) {
        this.details.status = __.is.sameType(this.details.value, type);
        return this;
    }

    isType(type) {
        this.details.status = __.getType(this.details.value) == type;
        return this;
    }

    last(func, n) {
        var type = __.getType(this.details.value);
        if (type == __.getType(__.i.array) || type == __.getType(__.i.obj))
            this.details.value = __.last(this.details.value, func, n);
        return this;
    }

    map(func, options) {
        var type = __.getType(this.details.value);
        if (type == __.getType(__.i.array) || type == __.getType(__.i.obj))
            this.details.value = __.map(this.details.value, func, options);
        return this;
    }

    max(func) {
        if (__.is.sameType(this.details.value, __.i.array))
            this.details.value = __.math.max(this.details.value, func);
        return this;
    }

    median(func) {
        if (__.is.sameType(this.details.value, __.i.array))
            this.details.value = __.math.max(this.details.value, func);
        return this;
    }

    min(func) {
        if (__.is.sameType(this.details.value, __.i.array))
            this.details.value = __.math.min(this.details.value, func);
        return this;
    }

    search(func, options) {
        var type = __.getType(this.details.value);
        if (type == __.getType(__.i.array) || type == __.getType(__.i.obj) || type == __.getType(__.i.args) || type == __.getType(__.i.string))
            this.details.value = __.search(this.details.value, func, options);
        return this;
    }

    set() {
        if (this.details.status)
            this.details.status = __.i.setConditions(this.details.value);
        return this;
    }

    sort(options) {
        var type = __.getType(this.details.value);
        if (type == __.getType(__.i.array) || type == __.getType(__.i.obj))
            this.details.value = __.sort(this.details.value, options);
        return this;
    }

    sum(func) {
        if (__.is.sameType(this.details.value, __.i.array))
            this.details.value = __.math.sum(this.details.value, func);
        return this;
    }

    value(def) {
        if (!this.details.status && def != undefined)
            return def;
        return this.details.value;
    }

    update(defaultObj) {
        if (this.details.status)
            this.details.value = __.fuse(defaultObj, this.details.value);
        else
            this.details.value = defaultObj;
        return this;
    }
}

// Base for creating a string parser
class StringParser {
    constructor(keywords, defaultAction, options) {
        var keyChars = {},
            keyWords = {};

        __.all(keywords, (x, y) => {
            if (y.length > 1)
                keyWords[y] = x;
            else
                keyChars[y] = x;
        });

        this.keyChars = keyChars;
        this.keyWords = keyWords;
        this.def = defaultAction;
        this.options = (options) ? options : {};
    }

    parse(str) {
        var self = this,
            options = __.flow(self.options).set().update({ skip: 0, bubble: true, ignoreCase: true }).value(),
            char = '',
            idx = 0,
            func = () => { },
            called = false;

        __.all(str, (a, b) => {
            if (options.skip > 0)
                return options.skip--;
            options.bubble = true;
            called = false;
            char = a;
            idx = parseInt(b);

            func = self.keyChars[char];
            if (func != undefined) {
                func(char, idx, str, options);
                called = true;
            }
            __.all(self.keyWords, (x, y) => {
                if (options.bubble || !called) {
                    if (((y[0] && options.ignoreCase) ? y[0].toLowerCase() : y[0]) == ((char && options.ignoreCase) ? char.toLowerCase() : char)) {
                        var pass = true;
                        var comp = '';
                        __.all(y, (c, d) => {
                            comp = str[idx + parseInt(d)];
                            if (((c && options.ignoreCase) ? c.toLowerCase() : c) != ((comp && options.ignoreCase) ? comp.toLowerCase() : comp))
                                pass = false;
                        });
                        if (pass) {
                            func = x;
                            if (func != undefined) {
                                options.skip = y.length - 1;
                                func(y, idx, str, options);
                                called = true;
                            }
                        }
                    }
                }
            });
            if (!called)
                self.def(char, idx, str, options);
        });
    }
}

// Parsing element style params from json to string and vise versa
class StyleParser {
    constructor(obj) {
        this.i = {};
        this.merge(obj);
    }

    clear() {
        this.i = {};
    }

    get(p) {
        return this.i[p];
    }

    merge(style) {
        var self = this;
        if (style) {
            if (__.is.sameType(style, __.i.string)) {
                var values = style.split(';');
                __.all(values, (p) => {
                    if (p != "") {
                        var a = p.split(/:(.+)/);
                        self.i[a[0].trim()] = a[1].trim();
                    }
                });
            } else if (__.is.sameType(style, __.i.obj))
                __.fuse(self.i, style);
        }
    }

    remove(p) {
        delete this.i[p];
    }

    set(p, value) {
        this.i[p] = value;
    }

    toObject() {
        return this.i;
    }

    toString() {
        var retVal = '';
        __.all(this.i, (p, k) => {
            if (p)
                retVal += (k + ':' + p + ';');
        });
        return retVal;
    }
}

// Parsing attribute params from json to string and vise versa
class AttrParser {
    constructor(obj) {
        this.i = {};
        this.merge(obj);
    }

    clear() {
        this.i = {};
    }

    get(p) {
        return this.i[p];
    }

    merge(style) {
        var self = this;
        if (style) {
            if (__.is.sameType(style, __.i.string)) {
                var values = style.split(';');
                __.all(values, (p) => {
                    if (p != "") {
                        var a = p.split('=');
                        self.i[a[0].trim()] = a[1].replace('"', '').trim();
                    }
                });
            } else if (__.is.sameType(style, __.i.obj)) {
                __.fuse(self.i, style);
            }
        }
    }

    remove(p) {
        delete this.i[p];
    }

    set(p, value) {
        this.i[p] = value;
    }

    append(p, value) {
        this.i[p] += ' ' + value;
    }

    toObject() {
        return this.i;
    }

    toString() {
        var retVal = '';
        __.all(this.i, (p, k) => {
            if (p)
                retVal += (k + '="' + p + '" ');
        });
        return retVal;
    }
}

// Json Element Template Builder
class El {
    constructor(obj) {
        this.tag = 'div';
        this.html = [];
        this.style = new StyleParser({});
        this.attr = new AttrParser({});
        this.identifier = 'Element Parser';
        this.excludeEndTagsOn = ['img', 'br', 'input', 'link'];
        var self = this;

        __.flow(obj.tag).def().isTrue((v) => { self.tag = v.value; });
        __.flow(obj.html).def().isTrue((v) => { self.setHtml(v.value); });
        __.flow(obj.style).def().isTrue((v) => { self.setStyle(v.value); });
        __.flow(obj.attr).def().isTrue((v) => { self.setAttr(v.value); });
    }

    setHtml(html) {
        var self = this;
        if (html) {
            if (__.is.array(html))
                self.html = html;
            else
                self.html = [html];
        }
    }

    setStyle(style) {
        this.style.clear();
        this.style.merge(style);
    }

    setAttr(attr) {
        this.attr.clear();
        this.attr.merge(attr);
    }

    append(item) {
        if (__.is.def(item) && item.identifier != this.identifier)
            this.html.push(new El(item));
        else
            this.html.push(item);
        return this;
    }

    appendEach(list, func) {
        var self = this;
        if (__.is.function(func))
            __.all(list, (v) => { self.append(func(v)); });
        else
            __.all(list, (v) => { self.append(v); });
        return self;
    }

    toString() {
        var content = '',
            self = this;
        __.all(this.html, (h) => {
            if (__.is.object(h) && self.identifier != h.identifier)
                content += new El(h).toString();
            else
                content += h.toString();
        });
        this.attr.set('style', this.style.toString());
        if (__.contains(this.i.excludeEndTagsOn, (t) => { return (self.tag == t); }) && html.length == 0)
            return '<{0} {1}" />'.format(this.tag, this.attr.toString());
        return '<{0} {1}>{2}</{3}>'.format(this.tag, this.attr.toString(), content, this.tag);
    }
}

// Overwrite Payload for __.fuse() deep updates, will overwrite target object/array instead of looping through it to deep copy it
class Overwrite {
    constructor(payload) {
        this.i = payload;
        this.identifier = 'Replace Object';
    }

    content() {
        return this.i;
    }
}

// Configuration object with layering abilities that make extensive configs easy
class Config {
    constructor(options) {
        this.i = {};
        this.identifier = 'Config Object';
        this.registry = {};
        var self = this;
        if (__.is.object(options))
            self.update(options);
    }

    update(c, deep) {
        var self = this;
        if (c) {
            if (deep)
                __.fuse(self.i, c, true);
            else
                __.fuse(self.i, c);
        }
        __.all(self.registry, (func, key, event) => {
            if (__.is.function(func))
                func(self.i, c);
        });
    }

    copyTo(o) {
        var retVal = null,
            self = this;
        __.flow(o).def()
            .isTrue(() => {
                if (__.flow(o.identifier).def().equals('Config Object').result)
                    retVal = __.fuse(o.i, self.i);
                else
                    retVal = __.fuse(o, self.i);
            })
            .isFalse(() => { retVal = __.fuse({}, self.i) });
        return retVal;
    }

    get(key) {
        var self = this, retVal = null;
        if (key)
            retVal = self.i[key];
        return retVal;
    }

    set(key, value) {
        var self = this;
        if (key)
            self.i[key] = value;
    }

    remove(key) {
        var self = this;
        if (key)
            delete self.i[key];
    }

    handler(key, func) {
        var self = this;
        if (func)
            self.registry[key] = func;
        else
            delete self.registry[key];
    }

    getTrimmed() {
        var me = this.i;
        var retVal = {};
        __.all(me, (v1, k1) => {
            __.flow(v1).def().getProperty('identifier').equals('Config Object')
                .isTrue(() => { retVal[k1] = v1.getTrimmed(); })
                .isFalse(() => { retVal[k1] = v1; });
        });
        return retVal;
    }
}

// Event Based View Controller
class ViewMaster {
    constructor(options) {
        this.i = new Config({
            views: [],
            update: (view) => { },
            current: null,
            currentIndex: null,
            'default': ''
        });
        this.identifier = 'Config Object';
        var self = this;
        if (__.is.object(options))
            self.i.update(options);
    }

    get(view) {
        return __.search(this.i.i.views, (value, idx) => {
            value.index = idx;
            return (value.name == view);
        });
    }

    set(view) {
        var self = this;
        if (view) {
            self.i.i.current = self.get(view);
            self.i.i.update(self.i.i.current);
            if (__.is.function(self.i.i.current.update))
                self.i.i.current.update(self.i.i.current);
        } else
            self.set(self.i.i.default);
    }

    modify(view, data, deep) {
        var viewItem = this.get(view), self = this;
        if (viewItem)
            __.fuse(self.i.i.views[viewItem.index]);
    }

    currentView() {
        return this.i.i.current;
    }

    update(options, deep) {
        this.i.update(options, deep);
        __.all(this.i.i.views, (v, i) => { v.index = i; });
    }

    hasViews() {
        return this.i.i.views.length > 0;
    }

    getViews() {
        return this.i.i.views;
    }
}

// Event Controller, with layered 'Base' events that execute before client level events
class EventMaster {
    constructor(events) {
        this.i = {};
        this.identifier = 'Config Object';
        if (events)
            this.update(events);
    }

    addEvent(eventName, func) {
        if (!__.is.set(this.i[eventName]))
            this.i[eventName] = [];
        if (__.is.array(func))
            this.i[eventName] = this.i[eventName].concat(func);
        else
            this.i[eventName].push(func);
    }

    removeEvent(eventName, func) {
        if(!__.is.set(func))
            delete this.i[eventName];
        else
            __.remove(this.i[eventName], func);
    }

    raise(eventName, data) {
        if (this.i[eventName]) {
            var self = this,
                data = { event: eventName, before: true, after: false, isCancelled: false, data: data };
            __.all(this.i[eventName], x => x(data));
            return {
                complete: () => {
                    data.before = false;
                    data.after = true;
                    if (!data.isCancelled)
                        __.all(this.i[eventName], x => x(data));
                }
            };
        }
    }

    update(options) {
        var self = this;
        __.all(options, (x, y) => self.addEvent(y, x) );
    }
}

// Event Based Stop Watch with stop, start and reset abilities along with an on tick event
class StopWatch {
    constructor(options) {
        var self = this;
        self.lastStarted = 0;
        self.lapsedTime = 0;
        self.clock = null;
        self.settings = {
            onTick: (time) => { },
            tickRate: 500
        };
        self.settings = __.flow(options).def().update(self.settings).value();

        self.update = () => { self.settings.onTick(self.getTime()); };
        self.start = () => {
            self.clock = setInterval(self.update, self.settings.tickRate);
            self.lastStarted = self.lastStarted ? self.lastStarted : self.now();
        };
        self.stop = () => {
            self.lapsedTime = self.lastStarted ? self.lapsedTime + self.now() - self.lastStarted : self.lapsedTime;
            self.lastStarted = 0;
            clearInterval(self.clock);
        };
        self.reset = () => {
            self.stop();
            self.lapsedTime = self.lastStarted = 0;
            self.update();
        };
        self.getRawTime = () => { return self.lapsedTime + (self.lastStarted ? self.now() - self.lastStarted : 0); };
        self.getTime = () => {
            var h = 0, m = 0, s = 0, ms = 0;
            var time = self.getRawTime();

            h = Math.floor(time / (60 * 60 * 1000));
            time = time % (60 * 60 * 1000);
            m = Math.floor(time / (60 * 1000));
            time = time % (60 * 1000);
            s = Math.floor(time / 1000);
            ms = time % 1000;

            return { Hours: self.pad(h, 2), Minutes: self.pad(m, 2), Seconds: self.pad(s, 2), MilliSeconds: self.pad(ms, 3), Raw: time };
        };
        self.pad = (num, size) => {
            var s = "0000" + num;
            return s.substr(s.length - size);
        };
        self.now = () => { return (new Date()).getTime(); };
    }
}

// More or less a polyfill for missing object functions
class Enumerable {
    constructor() {}

    get count() {
        return this.getKeys.length;
    }

    get getKeys() {
        if(this.keys)
            return this.keys();
        return __.map(this, (x, y) => y);
    }

    get getValues() {
        if(this.values)
            return this.values();
        return __.map(this, (x, y) => x);
    }

    each(func) {
        __.all(this, func);
    }
}

// A less efficent inheritable array class
class List extends Enumerable {
    constructor(items) {
        super();
        if(__.is.set(items))
            this.addRange(items);
    }

    set count(value) {
        var count = this.count;
        if(count > value)
            this.removeRange(value - 1);
    }

    add(item, options) {
        var hasOptions = (options && options.start),
            start = (hasOptions) ? options.start : 0;
        while(this.hasOwnProperty(start))
            start++;
        this[start] = item;
        if(hasOptions)
            options.start = start;
        return this;
    }

    addRange(items) {
        if(__.is.array(items) || items instanceof Enumerable) {
            var self = this,
                opt = { start: 0 };
            __.all(items, x => self.add(x, opt));
        }
        return this;
    }

    clear() {
        var self = this;
        __.all(self, (x, y) => { delete self[y]; });
        return self;
    }

    contains(func) {
        if(__.is.function(func))
            return __.contains(this, func);
        return __.contains(this, x => x == item);
    }

    indexOf(item) {
        return __.search(this, x => x == item, { getKey: true });
    }

    insert(key, item) {
        var self = this, 
            idx = parseInt(key),
            keys = __.sort(__.filter(__.map(this.getKeys, x => parseInt(x)), x => x >= idx), { dir: 'desc' });
        __.all(keys, x => { self[x + 1] = self[x]; });
        self[idx] = item;
        return this;
    }

    insertRange(key, items) {
        var self = this, 
            idx = parseInt(key),
            count = (items.length != undefined) ? items.length : items.count,
            keys = __.sort(__.filter(__.map(this.getKeys, x => parseInt(x)), x => x >= idx), { dir: 'desc' });
        __.all(keys, x => { self[x + count] = self[x]; });
        __.all(items, x => { self[idx] = x; idx++; });
        return this;
    }

    getRange(start, end) {
        var self = this, 
            key = 0,
            keys = __.map(self.getKeys, x => parseInt(x)),
            begin = parseInt(start),
            end = (end) ? parseInt(end) : keys[keys.length - 1];
        return __.map(keys, (x, y, z) => {
            if(y >= begin && y <= end)
                return x;
            z.skip = true;
        });
    }

    remove(item) {
        var idx = this.indexOf(item);
        if(idx != null)
            this.removeAt(idx);
        return this;
    }

    removeAt(key) {
        var self = this, 
            idx = parseInt(key),
            keys = __.filter(__.map(this.getKeys, x => parseInt(x)), x => x > idx);
        delete this[idx];
        __.all(keys, x => self[x - 1] = self[x]); // shift all after keys down one
        delete this[keys[keys.length - 1]]; // remove tail copy
        return this;
    }

    removeRange(start, end) {
        var self = this,
            keys = __.map(this.getKeys, x => parseInt(x)),
            begin = parseInt(start),
            end = (end) ? parseInt(end) : keys[keys.length - 1];
        __.all(__.filter(keys, x => (x >= begin && x <= end)), x => delete self[x]);
        if(end < keys[keys.length - 1]) {
            __.all(__.filter(keys, x => x > end), x => self[begin++] = self[x]);
            delete self[keys[keys.length - 1]]; // remove tail copy
        }
        return this;
    }

    select(func) {
        var x = this.toArray();
        x = __.map(x, func);
        return new List(x);
    }

    sort(func, options) {
        var x = this.toArray();
        x = __.sort(x, options);
        var self = this;
        __.all(x, (v, k) => self[k] = x);
        return this;
    }

    toArray() {
        var ret = [];
        __.all(this, (x, y) => { ret[y] = x; });
        return ret;
    }

    where(func) {
        var x = this.toArray();
        x = __.filter(x, func);
        return new List(x);
    }
}

// Basic object hash table with syntactic sugar
class Dictionary extends Enumerable {
    constructor() { super(); }

    add(key, value) {
        this[key] = value;
    }

    clear() {
        var self = this;
        __.all(self, (x, y) => self.remove(y));
    }

    containsKey(key) {
        return __.is.set(this[key]);
    }

    containsValue(value) {
        return __.contains(this, x => x == value);
    }

    remove(key) {
        delete this[key];
    }
}

// [BETA] Typical Linked Node List by design
class LinkedList {
    constructor(options) {
        this.start = __.flow(options).def().getProperty('start').value(null);
        this.end = __.flow(options).def().getProperty('end').value(null);
    }

    add(data) {
        if (this.start === null) {
            this.start = this.newNode(data, null);
            this.end = this.start;
        } else {
            this.end.next = this.newNode();
            this.end = this.end.next;
        }
        this.end.data = data;
    }

    each(func) {
        var current = this.start;
        while (current !== null) {
            func(current);
            current = current.next;
        }
    }

    insertFirst(data) {
        this.start = this.newNode(data, this.start);
    }

    insertAfter(node, data) {
        var current = this.start;
        while (current !== null) {
            if (current.data === node) {
                var temp = this.newNode(data, current.next);
                if (current === this.end)
                    this.end = temp;
                current.next = temp;
                return;
            }
            current = current.next;
        }
    }

    itemAt(index) {
        var current = this.start;
        while (current !== null) {
            index--;
            if (i === 0)
                return current;
            current = current.next;
        }
        return null;
    }

    newNode(data, next) {
        return { data: (data) ? data : null, next: (next) ? next : null };
    }

    remove(data) {
        var current = this.start,
            previous = this.end;
        while (current !== null) {
            if (data === current.data) {
                if (current === this.start) {
                    this.start = current.next;
                    return;
                }
                if (current === this.end)
                    this.end = previous;
                previous.next = current.next;
                return;
            }
            previous = current;
            current = current.next;
        }
    }
}

// [BETA] Ticking task checker will wait until all work is complete then execute its success action or if the time runs out it will execute its failed action
class Contract {
    constructor(options) {
        this.options = __.flow(options).def().update({
            tasks: [],
            success: () => { },
            fail: () => { },
            delay: 1,
            max: 20,
            elapsed: 0
        }).value();
    }

    newTask(opt) {
        var item = __.flow(opt).def().update({ complete: false }).value();
        this.options.tasks.push(item);
        return item;
    }

    hasUncompletedTasks() {
        var retVal = false;
        __.all(this.options.tasks, (t, k, e) => {
            if (!t.complete) {
                retVal = true;
                e.stop = true;
            }
        });
        return retVal;
    }

    process() {
        var me = this;
        if (me.options.elapsed < me.options.max) {
            me.options.elapsed += me.options.delay;
            if (me.hasUncompletedTasks())
                setTimeout(() => { me.process(); }, me.options.delay * 1000);
            else
                setTimeout(() => { me.options.success(); }, me.options.delay * 1000);
        } else {
            me.options.fail();
        }
    }

    clear() {
        this.options.tasks = [];
        this.options.elapsed = 0;
    }
}

__.lib = {
    ConditionChain: ConditionChain,
    StringParser: StringParser,
    StyleParser: StyleParser,
    AttrParser: AttrParser,
    El: El,
    Overwrite: Overwrite,
    Config: Config,
    ViewMaster: ViewMaster,
    EventMaster: EventMaster,
    Enumerable: Enumerable,
    List: List,
    Dictionary: Dictionary,
    LinkedList: LinkedList,
    StopWatch: StopWatch,
    Contract: Contract
};
module.exports = __;