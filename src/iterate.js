"use strict";

(function() {
    // Prototype Modification
    String.prototype.replaceAll = function (str1, str2, ignore) {
        return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g, "\\$&"), ignore ? "gi" : "g"), typeof str2 == "string" ? str2.replace(/\$/g, "$$$$") : str2);
    };
    String.prototype.replaceWhile = function (str1, str2, condition, ignoreCase) {
        var result = this.replaceAll(str1, str2, ignoreCase);
        var limit = 10000;
        while (condition(result) && limit--) {
            result = result.replaceAll(str1, str2, ignoreCase);
        }return result;
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
        if (ignoreCase) return this.toLowerCase().indexOf(value.toLowerCase()) > -1;
        return this.indexOf(value) > -1;
    };
    String.prototype.whiteout = function (items) {
        var self = this;
        if (items) {
            var temp = self.slice(0);
            if (__.is.array(items)) __.all(items, function (v) {
                temp = temp.replace(v, '');
            });else if (__.is.string(items)) temp = temp.replace(items, '');
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
        if (index > -1) return this.substring(0, index);
        return this;
    };

    var __ = new (function () {
        var me = this;
        // Constant Containers
        me.i = {
            obj: {},
            array: [],
            function: function() {},
            string: 'ABC',
            integer: 1,
            bool: true,
            date: new Date(),
            args: arguments,
            null: null,
            undefined: undefined,
            nan: NaN,
            setConditions: function (object) {
                return object != null && object != undefined && object != NaN;
            },
            defaultConditions: function (object) {
                return Boolean(object);
            },
            formatOptions: function () {
                return { value: 0, decimal: 2, digits: -1, dynamic: false, form: '{0}', delim: '', type: '' };
            }
        };
        me.types = {
            obj: 'Object',
            array: 'Array',
            function: 'Function',
            string: 'String',
            integer: 'Number',
            bool: 'Boolean',
            date: 'Date',
            args: 'Arguments',
            null: 'Null',
            undefined: 'Undefined',
            nan: 'Number'
        };
        me.guidMap = {};

        // Base Functions
        me.all = function (obj, func, all) {
            /// <summary>Iterates over any interable object, arrays, objects, arguments and more.</summary>
            /// <param type="Iterable" name="obj">The item to iterate over, works on objects, arrays, argumates and anything that can iterate.</param>
            /// <param type="Function" name="func">The function called each iteration, passed (value, key, event).</param>
            /// <param type="Bool(Optional)" name="all">The optional bool to toggle off the hasOwnProperty check, note that it will still work on arrays and arguments regardless.</param>
            var event = { stop: false },
                getAll = (all === true);
            if(me.is.array(obj)) {
                var length = obj.length;
                for(var i = 0; i < length; i++) {
                    func(obj[i], i, event);
                    if(event.stop) break;
                }
            } else if(me.is.number(obj)) {
                var count = 0,
                    target = Math.abs(obj);
                while(count < target) {
                    count++;
                    func(count, target, event);
                    if(event.stop) break;
                }
            } else {
                for (var val in obj) {
                    if (all || obj.hasOwnProperty(val)) 
                        func(obj[val], val, event);
                    if(event.stop) break;
                }
            }
        };
        me.call = function (obj, args, methodChain) {
            /// <summary>Iterates over an iterable and attempts to call a function at the end of the resulting method chain for each iteration. Ex: Calls every function in an array of functions.</summary>
            /// <param type="Iterable" name="obj">The item to iterate over, works on objects, arrays, argumates and anything that can iterate.</param>
            /// <param type="Arguments(Optional)" name="args">Arguments passed into the recieving functions.</param>
            /// <param type="String(Optional)" name="methodChain">String based path to the object property. Ex: { item: { type: 1 } } with 'item' it will find { type: 1 } with 'item.type' it will find 1.</param>
            me.all(obj, function (v) {
                var prop = me.prop(v, methodChain);
                if (__.is.function(prop)) prop(args);
            });
        };
        me.class = function (construct, methods, inherit) {
            var customFuse = function customFuse(target, properties) {
                me.all(properties, function (x, y) {
                    if (me.is.function(x)) target[y] = x;else if (me.is.object(x)) {
                        // Allows user to set getters/setters
                        Object.defineProperty(target, y, me.fuse({
                            enumerable: false,
                            configurable: true
                        }, x));
                    }
                }, true);
                return target;
            };
            var proto = methods || {};
            if (inherit) {
                if (me.is.array(inherit)) me.all(inherit, function (x) {
                    proto = customFuse(Object.create(x.prototype), proto);
                });else proto = customFuse(Object.create(inherit.prototype), proto);
            } else proto = customFuse({}, proto);
            construct.prototype = proto;
            construct.prototype.constructor = construct;
            return construct;
        };
        me.contains = function (obj, func) {
            /// <summary>Attempts to search the first param for the result in the most optimized fashion as the following pairs show:
            /// (string, string), (string, function), (array, function), (array, value), (object, function), (object, value).</summary>
            /// <param type="Value" name="obj">Item to search based on the second params conditions.</param>
            /// <param type="String/Function/Value" name="func">String fragment, Function passed (value, key) need to return true/false, or raw value to search for.</param>
            /// <returns type="Bool">If the resulting conditions are met it will return true, otherwise false.</returns>
            var retVal = false;
            if (__.is.string(obj)) {
                if (me.is.function(func)) retVal = obj.contains(func(obj));else retVal = obj.contains(func);
            } else retVal = me.is.def(me.search(obj, func));
            return retVal;
        };
        me.count = function (obj, func) {
            /// <summary>Iterates over an iterable attempting to count the objects based on the returned value.</summary>
            /// <param type="Iterable" name="obj">The item to iterate over, works on objects, arrays, argumates and anything that can iterate.</param>
            /// <param type="Function(Optional)" name="func">Function to get you to the value you want to count, must return that value, if it is null, undefined or NaN it will not count the value.</param>
            /// <returns type="Integer">The total count of the values searched.</returns>
            var count = 0,
                key = me.is.function(func) ? func : function (v, k) {
                return v;
            };
            me.all(obj, function (v, k) {
                if (me.is.set(key(v, k))) count++;
            });
            return count;
        };
        me.debounce = function (func, time) {
            time || (time = 250);
            var timer = null;
            return function () {
                var context = this,
                    args = arguments;
                clearTimeout(timer);
                timer = setTimeout(function () {
                    func.apply(context, args);
                }, time);
            };
        };
        me.distinct = function(obj, func) {
            var index = [],
                isArray = me.is.array(obj),
                key = (func) ? func : function(x) { return x; };
            return me.map(obj, function(x, y, z) {
                var item = key(x);
                if(index.indexOf(item) == -1) { // index of means only distinct check ints/strings
                    index.push(item);
                    return (isArray) ? x : { key: y, value: x };
                } else
                    z.skip = true;
                console.log(index);
            }, { build: (isArray) ? [] : {} });
        };
        me.download = function (content, fileName, type) {
            /// <summary>Downloads a file from an array of strings given a name and type.</summary>
            /// <param type="Array" name="content">Array of strings joined together for the files content.</param>
            /// <param type="String" name="fileName">Name of the file without the extension which is added on by the third param.</param>
            /// <param type="String" name="type">File type, only current choice is 'csv'.</param>
            var fileMap = {
                'csv': { ext: '.csv', encoding: 'data:application/csv;charset=utf-8', parse: function(data) { return Array.isArray(data) ? data.join('') : data; } },
                'json': { ext: '.json', encoding: 'data:application/json;charset=utf-8', parse: function(data) { return me.is.string(data) ? data : JSON.stringify(data); } }
            };
            var fileType = fileMap[type.toLowerCase()];
            var data = fileType.parse(content);
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
        me.flow = function (obj) {
            /// <summary> Returns a ConditionChain object with additional function and operations based on the type of object passed in.</summary>
            /// <param type="Value" name="obj">Value to be checked and evaluated.</param>
            /// <returns type="ConditionChain">A chain object, which contains many different functions, to get the boolean result simply call [chain].result. For more see the ConditionChain class.</returns>

            return new ConditionChain({ initialValue: obj, value: obj });
        };
        me.first = function (obj, key, n) {
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
                    me.all(obj, function (v, k, e) {
                        if (count > n) e.stop = true;
                        count++;
                        if (key) retVal.push(k);else retVal.push(v);
                    });
                } else {
                    retVal = {};
                    me.all(obj, function (v, k, e) {
                        if (count > n) e.stop = true;
                        retVal[k] = v;
                        count++;
                    });
                }
            } else {
                me.all(obj, function (v, k, e) {
                    e.stop = true;
                    if (key) retVal = k;else retVal = v;
                });
            }
            return retVal;
        };
        me.filter = function (obj, func) {
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
                    me.all(obj, function (x, y, e) {
                        if (func(x, y, event)) ret.push(x);
                        if (event.stop) e.stop = true;
                    });
                } else if (me.is.object(obj)) {
                    ret = {};
                    me.all(obj, function (x, y, e) {
                        if (func(x, y, event)) ret[y] = x;
                        if (event.stop) e.stop = true;
                    });
                }
            } else if (me.is.object(func)) {
                var flag = null;
                ret = me.filter(obj, function (v) {
                    flag = true;
                    me.all(func, function (value, prop) {
                        if (v[prop] != value) 
                            flag = false;
                    });
                    return flag;
                });
            }
            return ret;
        };
        me.format = function (params) {
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
        me.fuse = function (obj1, obj2, deep, all) {
            /// <summary>Fuses the second parameter object into the first overriding its properties and creating new ones where necessary.
            /// Has detection for Config and Override Objects, allowing layering.</summary>
            /// <param type="Object" name="obj1">Base Object to be overwritten.</param>
            /// <param type="Object" name="obj2">Object that will overwrite.</param>
            /// <param type="Bool(Optional)" name="deep">If true fuse will enter deep copy mode and recursively iterate through arrays and objects.
            /// There is no recursive limit so be careful about object loops.</param>
            /// <returns type="Object">Returns obj1 after the resulting merge with obj2.</returns>
            var deepMode = deep || false;
            me.all(obj2, function (object, key, all) {
                if (me.is.object(object) && me.is.set(obj1[key]) && obj1[key]._identifier == 'Config Object') obj1[key].update(object, true);else if (me.is.object(object) && object._identifier == 'Replace Object') obj1[key] = object.content();else {
                    if (deepMode && (me.is.object(object) || me.is.array(object))) {
                        if (!me.is.set(obj1[key])) {
                            if (me.is.object(object)) obj1[key] = {};else if (me.is.array(object)) obj1[key] = [];
                        }
                        me.fuse(obj1[key], object, true);
                    } else obj1[key] = object;
                }
            });
            return obj1;
        };
        me.getType = function (obj) {
            /// <summary>Gets the type of object in string form.</summary>
            /// <param type="Value" name="obj">Object to get the type of.</param>
            /// <returns type="String">Returns the string portion containing the object identifier. Ex: 'object', 'array', 'string', 'boolean'...</returns>
            return me.i.obj.toString.call(obj).match(/\s([a-zA-Z]+)/)[1];
        };
        me.group = function (obj, func) {
            /// <summary>Groups up values given a function or string to get to the respective property, if nothing it will group by raw values.</summary>
            /// <param type="Iterable" name="obj">The item to iterate over, works on objects, arrays, argumates and anything that can iterate.</param>
            /// <param type="Function/String(Optional)" name="func">Function or string property chain that will attempt to get to the value of the object,
            /// if undefined it will just return the iterated object.</param>
            /// <returns type="Object">Returns an object with properties defining the groups and objects that match in arrays within those groups.</returns>
            var key = me.is.function(func) ? func : function (v) {
                    return me.prop(v, func);
                },
                retVal = {},
                value = null;
            me.all(obj, function (v) {
                value = key(v);
                if (me.flow(value).set().eval(function (x) { return me.is.string(x.value) || me.is.number(x.value); }).result) {
                    me.flow(retVal[value]).set()
                    .isTrue(function () { retVal[value].push(v); })
                    .isFalse(function () { retVal[value] = [v]; });
                }
            });
            return retVal;
        };
        me.guid = function (seperator, track) {
            /// <summary>Attempts to create a unique guid using random generators. Warning this guid is not tracked so there is a very very small chance it could be generated twice.</summary>
            /// <param type="String(Optional)" name="seperator">Optional parameter to set the seperator between random strings. Default is '-'.</param>
            /// <returns type="String">Returns a guid string.</returns>
            var sep = me.i.setConditions(seperator) ? seperator : '-';
            var guid = me.math.r16() + me.math.r16() + sep + me.math.r16() + sep + me.math.r16() + sep + me.math.r16() + sep + me.math.r16() + me.math.r16() + me.math.r16();
            if (track) {
                if (me.guidMap[track] && me.guidMap[track][guid]) 
                    return me.guid(seperator, track);
                else {
                    me.guidMap[track] = {};
                    me.guidMap[track][guid] = true;
                }
            }
            return guid;
        };
        me.intersect = function(obj1, obj2, func) {
            // TODO return array/obj containing items that both share
            var isArray = me.is.array(obj1);
            var build = [];
            var index1 = me.map(obj1, function(x, y) { return { value: y, key: (func) ? func(x) : x }; }, { build: {} });
            var index2 = me.map(obj2, function(x, y) { return { value: y, key: (func) ? func(x) : x }; }, { build: {} });
            me.all(index1, function(x, y) {
                if(index2[y] != undefined)
                    build.push(obj1[x]);
            });
            return build;
        };
        me.last = function (obj, key, n) {
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
                    me.all(process, function (v, k, e) {
                        if (count > n) e.stop = true;
                        count++;
                        if (key) retVal.push(k);else retVal.push(v);
                    });
                } else {
                    me.all(process, function (v, k, e) {
                        e.stop = true;
                        count++;
                        if (key) retVal = k;else retVal = v;
                    });
                }
            } else {
                me.all(obj, function (v, k, e) {
                    process.push(k);
                });
                process.reverse();
                if (n && n > 1) {
                    retVal = {};
                    me.all(process, function (v, k, e) {
                        if (count > n) e.stop = true;
                        retVal[v] = obj[v];
                        count++;
                    });
                } else {
                    me.all(process, function (v, k, e) {
                        e.stop = true;
                        if (key) retVal = v;else retVal = obj[v];
                        count++;
                    });
                }
            }
            return retVal;
        };
        me.map = function (obj, func, options) {
            /// <summary>Attempts to map the respective array or object to an array or object given the event parameter you can change the build object to an object, default is building an array.
            /// Ex: __.map([...], (v, k) => ({ value: v, key: k }), { build: {} }); will map an array to an object.</summary>
            /// <param type="Iterable" name="obj">The item to iterate over, works on objects, arrays, argumates and anything that can iterate.</param>
            /// <param type="Function" name="func">Function passed (value, key, event) needs to return something to be shoved into the map.
            /// If it returns nothing than the map fills with undefined.</param>
            /// <param type="Object(Optional)" name="e">Event param for loop customization like pushing multiple into the return object at once or skipping the current iteration or stopping the loop.</param>
            /// <returns type="Array/Object">Returns the mapped array or object.</returns>
            var event = me.flow(options).def().update({ stop: false, skip: false, pushMultiple: false, build: [] }).value();
            var isArray = me.is.array(event.build);
            var isObject = me.is.object(event.build);
            var key = me.is.function(func) ? func : function (v) { return v; };
            var add = function add(value) {
                if (isArray) 
                    event.build.push(value);
                else if (isObject) 
                    event.build[value.key] = value.value;
            };
            me.all(obj, function (x, y, e) {
                var value = key(x, y, event);
                if (event.skip) 
                    event.skip = false;
                else {
                    if (event.pushMultiple) {
                        me.all(value, function (v) {
                            return add(v);
                        });
                        event.pushMultiple = false;
                    } else 
                        add(value);
                }
                if (event.stop) 
                    e.stop = true;
            });
            return event.build;
        };
        me.match = function(obj1, obj2, options) {
            var event = me.flow(options).def().update({ checkType: false, recursive: true, explicit: false }).value();
            var flag = true;
            if(event.checkType)
                if(!me.is.sameType(obj1, obj2))
                    return false;
            if((!me.is.set(obj1) && me.is.set(obj2)) || (me.is.set(obj1) && !me.is.set(obj2)))
                return false;
            me.all(obj1, function(x, y, z) {
                if(event.recursive && (me.is.object(x) || me.is.array(x))) {
                    if(!me.match(x, obj2[y], event)) {
                        z.stop = true;
                        flag = false;
                    }
                } else if((event.explicit) ? obj2[y] !== x : obj2[y] != x) {
                    z.stop = true;
                    flag = false;
                }
            });
            return flag;
        };
        me.move = function (obj, key1, key2) {
            /// <summary>Attempts to move key value pair to target key value pair, uses internal methods on array objects.</summary>
            /// <param type="Array/Object" name="obj">The Object/Array which contains the key1 to be moved to key2.</param>
            /// <param type="String/Int" name="key1">The source key of the property to be moved.</param>
            /// <param type="String/Int" name="key2">The target key of the property to be moved.</param>
            /// <returns type="Array/Object">Returns the array or object passed in.</returns>
            if(key1 != key2) {
            if (me.is.array(obj)) 
                obj.splice(key2, 0, obj.splice(key1, 1)[0]);
            else {
                obj[key2] = obj[key1];
                delete obj[key1];
            }
            }
            return obj;
        };
        me.prop = function (obj, path, value) {
            /// <summary>Searches an object using a property path and returns the resulting value.</summary>
            /// <param type="Object" name="obj">The item to be searched along the path chain.</param>
            /// <param type="String(Optional)" name="path">String based path to the object property. Ex: { item: { type: 1 } } with 'item' it will find { type: 1 } with 'item.type' it will find 1.</param>
            /// <returns type="Value">Value of the resulting property chain, will be undefined if the value at the end isn't there, or if the chain is cut short.</returns>
            if (me.is.set(path) && me.is.set(obj) && path != '') {
                var current = obj,
                    paths = path.split('.');
                me.all(paths, function (p, i, e) {
                    current = current[p];
                    if (!me.is.set(current)) 
                        e.stop = true;
                });
                return current;
            } else return obj;
        };
        me.rank = function (obj, func) {
            /// <summary>Requires sorted array and will use a key in an attempt to rank the values.</summary>
            /// <param type="Array" name="obj">Array of sorted objects to be ranked.</param>
            /// <param type="Function(Optional)" name="options">Map function, default is to return the raw value.</param>
            /// <returns type="Array">Array of rankings by index.</returns>
            var sorted = [],
                key = func ? func : function (v) {
                return v;
            };
            sorted = me.map(obj, key);
            return me.map(obj.slice(), function (v) {
                var idx = sorted.indexOf(v);
                return idx == 0 ? idx + 1 : idx;
            });
        };
        me.remove = function (obj, item) {
            /// <summary>Attempts to remove the item from the object using which ever methods are most suited towards the object.</summary>
            /// <param type="Array/Object" name="obj">Object/Array from which to remove the item.</param>
            /// <param type="Object" name="item">Item to be removed, not the property name but the item itself.</param>
            /// <returns type="Array/Object">Returns the modified object.</returns>
            if (me.is.array(obj)) {
                var idx = obj.indexOf(item);
                if (idx > -1) obj.splice(idx, 1);
            } else if (me.is.object(obj)) {
                var key = me.search(obj, item, { getKey: true });
                delete obj[key];
            }
            return obj;
        };
        me.removeAt = function(obj, key) {
            if (me.is.array(obj)) {
                if (key > -1) 
                    obj.splice(key, 1);
            } else if (me.is.object(obj))
                delete obj[key];
            return obj;
        };
        me.search = function (obj, func, options) {
            /// <summary>Attempts to search the first param for the result in the most optimized fashion as the following pairs show:
            /// (array, function), (array, value), (object, function), (object, value).</summary>
            /// <param type="Value" name="obj">Item to search based on the second params conditions.</param>
            /// <param type="Function/Value" name="func">Function passed (value, key) need to return true/false, or raw value to search for.</param>
            /// <returns type="Value">If the resulting conditions are met it will return the value, otherwise null.</returns>
            var ret = null,
                opt = me.flow(options).set().update({ default: null, all: false, getKey: false }).value();
            if (me.is.function(func)) {
                me.all(obj, function (x, y, e) {
                    if (func(x, y)) {
                        ret = (opt.getKey) ? y : x;
                        e.stop = true;
                    }
                }, opt.all);
            } else if (me.is.array(obj)) {
                var idx = obj.indexOf(func);
                if (idx > -1) 
                    ret = (opt.getKey) ? idx : obj[idx];
            } else if (me.is.object(obj)) {
                me.all(obj, function (x, y, e) {
                    if (x == func) {
                        ret = (opt.getKey) ? y : x;
                        e.stop = true;
                    }
                }, opt.all);
            }
            return ret == null ? opt.default : ret;
        };
        me.sort = function (array, options) {
            /// <summary>Sort an array of values given options { dir: 'asc', key: v => v } both are optional, with the first giving direction and the second getting
            /// you to the value you are sorting upon.</summary>
            /// <param type="Array" name="array">The array of items to be sorted.</param>
            /// <param type="Object/Array(Optional)" name="options">The options shaping the sorting method. If it is an array it will sort on multiple options.</param>
            /// <returns type="Array"></returns>
            if (me.is.array(options)) {
                var o = me.map(options, function (x) {
                    return me.flow(x).def().update({ dir: 'asc', key: function key(v) {
                            return v;
                        } }).value();
                });
                var rev, result, A, B;
                return array.slice().sort(function (a, b) {
                    me.all(o, function (x, y, z) {
                        rev = o.dir == 'asc' ? true : false;
                        result = 0;
                        A = x.key(a);
                        B = x.key(b);

                        result = (A < B ? -1 : A > B ? 1 : 0) * [-1, 1][+!!rev];

                        if (result != 0) z.stop = true;
                    });
                    return result;
                });
            } else {
                var o = me.flow(options).def().update({ dir: 'asc', key: function key(v) {
                        return v;
                    } }).value();
                var rev = o.dir == 'asc' ? true : false;
                return array.slice().sort(function (a, b) {
                    var A = o.key(a),
                        B = o.key(b);
                    return (A < B ? -1 : A > B ? 1 : 0) * [-1, 1][+!!rev];
                });
            }
        };
        me.switch = function (value, hash, def) {
            /// <summary>A simplified switch statement for returning values. Ex: __.switch(1, { 1: 'Hello', 2: 'World' }, 'Fail') == 'Hello'</summary>
            /// <param type="Value" name="value">Preferably a string or integer, it's compared with the keys of the hash to find a matching value.</param>
            /// <param type="Object" name="hash">Object hash where the keys are compared to the input value, if a match is found the keys corresponding value is returned.</param>
            /// <param type="Value" name="def">The default value returned if nothing else matches.</param>
            /// <returns type="Value">The value returned from the hash, or if no match is found the default is returned.</returns>
            var retval = hash[value];
            me.flow(retval).def().isFalse(function () { retval = def; });
            if (me.is.function(retval)) 
                retval = retval(value);
            return retval;
        };
        me.throttle = function (func, time) {
            time || (time = 250);
            var last, timer;
            return function () {
                var context = this,
                    now = +new Date(),
                    args = arguments;

                if (last && now < last + time) {
                    clearTimeout(timer);
                    timer = setTimeout(function () {
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
        me.formats = {
            padleft: function(params) {
                var temp = params.value.toString();
                if (temp.length < params.places) 
                    return me.formats.padleft({ value: params.delim + temp, places: params.places, delim: params.delim });
                else 
                    return temp;
            }
        };
        me.is = {
            def: function (value) {
                /// <summary>Checks the value against the defined conditions which converts it to a boolean with result = Boolean(value); which means it will fail on empty strings, zeros and more.</summary>
                /// <param type="Value" name="value">Value to be checked.</param>
                /// <returns type="ConditionChain">A chain object, which contains many different functions, to get the boolean result simply call [chain].result. For more see the ConditionChain class.</returns>
                var ret = me.i.defaultConditions(value);
                return ret;
            },
            set: function (value) {
                /// <summary>Checks the value against the set conditions which checks it against undefined, null and NaN.</summary>
                /// <param type="Value" name="value">Value to be checked.</param>
                /// <returns type="ConditionChain">A chain object, which contains many different functions, to get the boolean result simply call [chain].result. For more see the ConditionChain class.</returns>
                var ret = me.i.setConditions(value);
                return ret;
            },
            sameType: function (var1, var2) {
                return me.getType(var1) == me.getType(var2);
            },
            function: function (object) {
                return me.getType(object) == me.types.function;
            },
            object: function (object) {
                return me.getType(object) == me.types.obj;
            },
            array: function (object) {
                return me.getType(object) == me.types.array;
            },
            args: function (object) {
                return me.getType(object) == me.types.args;
            },
            bool: function (object) {
                return me.getType(object) == me.types.bool;
            },
            string: function (object) {
                return me.getType(object) == me.types.string;
            },
            number: function (object) {
                return (me.getType(object) == me.types.integer) && !isNaN(object);
            },
            date: function(object) {
                return me.getType(object) == me.types.date;
            },
            null: function(object) {
                return me.getType(object) == me.types.null;
            },
            undefined: function(object) {
                return me.getType(object) == me.types.undefined;
            },
            nan: function(object) {
                return (me.getType(object) == me.types.integer) && isNaN(object);
            }
        };
        me.math = {
            r16: function () {
                return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
            },
            roundUpTo: function (value, step) {
                return Math.ceil(value / step) * step;
            },
            median: function (values, func) {
                var obj = values;
                if (func) obj = me.map(values, func);
                obj.sort(function (a, b) {
                    return a - b;
                });
                var half = Math.floor(obj.length / 2);
                if (obj.length % 2) 
                    return obj[half];
                else 
                    return (obj[half - 1] + obj[half]) / 2.0;
            },
            sum: function (values, func) {
                var sum = 0;
                me.all(values, function (x) { sum += (func) ? func(x) : x; });
                return sum;
            },
            average: function (values, func) {
                var sum = me.math.sum(values, func);
                if (sum > 0 || sum < 0) 
                    return sum / values.length;
                return 0;
            },
            max: function (values, func) {
                var ret = null;
                me.all(values, function(x) {
                    if(ret == null)
                        ret = x;
                    if(func) {
                        if (values[x] > ret) 
                            ret = values[x];
                    } else {
                        var temp = func(values[x]);
                        if (temp > ret) 
                            ret = temp;
                    }
                });
                return ret;
            },
            min: function (values, func) {
                var ret = null;
                me.all(values, function(x) {
                    if(ret == null)
                        ret = x;
                    if(func) {
                        if (values[x] < ret) 
                            ret = values[x];
                    } else {
                        var temp = func(values[x]);
                        if (temp < ret) 
                            ret = temp;
                    }
                });
                return ret;
            },
            percentages: function (values, func) {
                var total = me.math.sum(values, func);
                return me.map(values, function(x, y) {
                    return (total != 0) ? (((func) ? func(x) : x) / total) : 0;
                });
            }
        };
        me.render = {
            blend: function (c0, c1, p) {
                /// <summary>Blends the second hex color into the first by a percentage</summary>
                /// <param type="String" name="c0">Primary Hex string to be blended. Ex: '#FFFFFF'</param>
                /// <param type="String" name="c1">Secondary Hex string to be blended into the first. Ex: '#000000'</param>
                /// <param type="Decimal" name="p">Percentage of the second hex to be blended into the first</param>
                /// <returns type="Hex String">Resulting hex string of the blend.</returns>
                var f = parseInt(c0.slice(1), 16),
                    t = parseInt(c1.slice(1), 16),
                    R1 = f >> 16,
                    G1 = f >> 8 & 0x00FF,
                    B1 = f & 0x0000FF,
                    R2 = t >> 16,
                    G2 = t >> 8 & 0x00FF,
                    B2 = t & 0x0000FF;
                return "#" + (0x1000000 + (Math.round((R2 - R1) * p) + R1) * 0x10000 + (Math.round((G2 - G1) * p) + G1) * 0x100 + (Math.round((B2 - B1) * p) + B1)).toString(16).slice(1);
            },
            bytesToImageSrc: function (bytes, type) {
                // el.src = __.render.bytesToImage( [ byteArrayFromServer ].join('') );
                return "data:image/{0};base64,{1}".format(type ? type : 'png', bytes);
            },
            bytesToCanvas: function (bytes, type, canvas, coords) {
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
                img.src = "data:image/{0};base64,{1}".format(type ? type : 'png', base64);
                img.onload = function () {
                    console.log("Image Onload");
                    ctx.drawImage(img, coords[0], coords[1], canvas.width, canvas.height);
                };
                img.onerror = function (stuff) {
                    console.log("Img Onerror:", stuff);
                };
            }
        };
    })();

    // Wrapper for weakmap for simplistic private variable management
    var PrivateStore = __.class(function() {
        this.map = new WeakMap();
    },{
        context: function(context, func) {
            return func(this.map.get(context));
        },
        bind: function(context, data) {
            this.map.set(context, (__.is.object(data)) ? data : {});
        },
        get: function(context, path) {
            return __.prop(this.map.get(context), path);
        },
        set: function(context, path, value) {
            var paths = path.split('.');
            if(paths.length > 0) {
                var fragment = paths.pop(),
                    obj = this.map.get(context);
                __.all(paths, function(x) {
                    if(!__.is.set(obj[x]))
                        obj[x] = {};
                    obj = obj[x];
                });
                obj[fragment] = value;
            }
        }
    });

    // [Testing] Chaining Conditions/Actions by a boolean evaluation
    var ConditionChain = __.class(function (value) {
        this.details = __.fuse({
            initialValue: value,
            value: value,
            status: true
        }, value);
    }, {
        result: { get: function() { return this.details.status; } },
        all: function all(func) {
            var type = __.getType(this.details.value);
            if (type == __.types.array || type == __.types.object || type == __.types.args || type == __.types.string) __.all(this.details.value, func);
            return this;
        },
        append: function append(value) {
            var type = __.getType(this.details.value);
            if (type == __.types.array) 
                this.details.value.push(value);
            else if (type == __.types.string && __.is.string(value)) 
                this.details.value += value;
            return this;
        },
        appendTo: function appendTo(value) {
            var type = __.getType(this.details.value);
            if (type == __.types.array) 
                this.details.value.unshift(value);
            else if (type == __.types.string && __.is.string(value)) 
                this.details.value = value + this.details.value;
            return this;
        },
        average: function average(func) {
            if (__.is.array(this.details.value)) this.details.value = __.math.average(this.details.value, func);
            return this;
        },
        call: function call(args, chain) {
            var type = __.getType(this.details.value);
            if (type == __.types.array || type == __.types.object || type == __.types.args || type == __.types.string) __.call(this.details.value, args, chain);
            return this;
        },
        contains: function contains(func) {
            if (this.details.status) {
                var type = __.getType(this.details.value);
                if (type == __.types.array || type == __.types.object || type == __.types.args || type == __.types.string) this.details.value = __.contains(this.details.value, func);
            }
            return this;
        },
        count: function count(func) {
            var type = __.getType(this.details.value);
            if (type == __.types.array || type == __.types.object || type == __.types.args || type == __.types.string) this.details.value = __.count(this.details.value);
            return this;
        },
        def: function def() {
            if (this.details.status) this.details.status = __.i.defaultConditions(this.details.value);
            return this;
        },
        equals: function equals(value) {
            if (this.details.status) this.details.status = this.details.value == value;
            return this;
        },
        equalsExplicit: function equalsExplicit(value) {
            if (this.details.status) this.details.status = this.details.value === value;
            return this;
        },
        evaluate: function evaluate(condition) {
            if (this.details.status) condition(this.details);
            return this;
        },
        filter: function filter(func) {
            var type = __.getType(this.details.value);
            if (type == __.types.array || type == __.types.object) this.details.value = __.filter(this.details.value, func);
            return this;
        },
        first: function first(func, n) {
            var type = __.getType(this.details.value);
            if (type == __.types.array || type == __.types.object) this.details.value = __.first(this.details.value, func, n);
            return this;
        },
        getProperty: function getProperty(propChain) {
            this.details.value = __.prop(this.details.value, propChain);
            return this;
        },
        group: function group(func) {
            var type = __.getType(this.details.value);
            if (type == __.types.array || type == __.types.object) this.details.value = __.group(this.details.value, func);
            return this;
        },
        isTrue: function isTrue(func) {
            if (this.details.status) func(this.details);
            return this;
        },
        isFalse: function isFalse(func) {
            if (!this.details.status) func(this.details);
            return this;
        },
        isSameType: function isSameType(type) {
            this.details.status = __.is.sameType(this.details.value, type);
            return this;
        },
        isType: function isType(type) {
            this.details.status = __.getType(this.details.value) == type;
            return this;
        },
        last: function last(func, n) {
            var type = __.getType(this.details.value);
            if (type == __.types.array || type == __.types.object) this.details.value = __.last(this.details.value, func, n);
            return this;
        },
        map: function map(func, options) {
            var type = __.getType(this.details.value);
            if (type == __.types.array || type == __.types.object) this.details.value = __.map(this.details.value, func, options);
            return this;
        },
        max: function max(func) {
            if (__.is.array(this.details.value)) this.details.value = __.math.max(this.details.value, func);
            return this;
        },
        median: function median(func) {
            if (__.is.array(this.details.value)) this.details.value = __.math.max(this.details.value, func);
            return this;
        },
        min: function min(func) {
            if (__.is.array(this.details.value)) this.details.value = __.math.min(this.details.value, func);
            return this;
        },
        search: function search(func, options) {
            var type = __.getType(this.details.value);
            if (type == __.types.array || type == __.types.object || type == __.types.args || type == __.types.string) this.details.value = __.search(this.details.value, func, options);
            return this;
        },
        set: function set() {
            if (this.details.status) this.details.status = __.i.setConditions(this.details.value);
            return this;
        },
        sort: function sort(options) {
            var type = __.getType(this.details.value);
            if (type == __.types.array || type == __.types.object) this.details.value = __.sort(this.details.value, options);
            return this;
        },
        sum: function sum(func) {
            if (__.is.array(this.details.value)) this.details.value = __.math.sum(this.details.value, func);
            return this;
        },
        value: function value(def) {
            if (!this.details.status && def != undefined) return def;
            return this.details.value;
        },
        update: function update(defaultObj) {
            if (this.details.status) this.details.value = __.fuse(defaultObj, this.details.value);else this.details.value = defaultObj;
            return this;
        }
    });

    // Base for creating a string parser
    var StringParser = __.class(function(keywords, defaultAction, options) {
        var keyChars = {},
            keyWords = {};

        __.all(keywords, function (x, y) {
            if (y.length > 1) 
                keyWords[y] = x;
            else 
                keyChars[y] = x;
        });

        this.keyChars = keyChars;
        this.keyWords = keyWords;
        this.options = options ? options : {};
    }, {
        parse: function(str) {
            var self = this,
                options = __.flow(self.options).set().update({ skip: 0, bubble: true, ignoreCase: true, defaultAction: function() {  } }).value(),
                char = '',
                idx = 0,
                func = function() { },
                called = false;

            __.all(str, function(a, b) {
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
                __.all(self.keyWords, function(x, y) {
                    if (options.bubble || !called) {
                        if (((y[0] && options.ignoreCase) ? y[0].toLowerCase() : y[0]) == ((char && options.ignoreCase) ? char.toLowerCase() : char)) {
                            var pass = true;
                            var comp = '';
                            __.all(y, function(c, d) {
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
                    options.defaultAction(char, idx, str, options);
            });
        }
    });

    // Parsing element style params from json to string and vise versa
    var StyleParser = __.class(function(obj) {
        this.i = {};
        this.merge(obj);
    }, {
        clear: function() {
            this.i = {};
        },
        get: function(key) {
            this.i[key];
        },
        merge: function(style) {
            var self = this;
            if (style) {
                if (__.is.string(style)) {
                    var values = style.split(';');
                    __.all(values, function (p) {
                        if (p != "") {
                            var a = p.split(/:(.+)/);
                            self.i[a[0].trim()] = a[1].trim();
                        }
                    });
                } else if (__.is.object(style)) __.fuse(self.i, style);
            }
        },
        remove: function(key) {
            delete this.i[key];
        },
        set: function(key, value) {
            this.i[key] = value;
        },
        toJson: function() {
            return this.i;
        },
        toString: function() {
            var retVal = '';
            __.all(this.i, function (p, k) {
                if (p) retVal += k + ':' + p + ';';
            });
            return retVal;
        }
    });

    // Parsing attribute params from json to string and vise versa
    var AttrParser = __.class(function(obj) {
        this.i = {};
        this.merge(obj);
    }, {
        clear: function() {
            this.i = {};
        },
        get: function(key) {
            this.i[key];
        },
        merge: function(style) {
            var self = this;
            if (style) {
                if (__.is.string(style)) {
                    var values = style.split(';');
                    __.all(values, function (p) {
                        if (p != "") {
                            var a = p.split('=');
                            self.i[a[0].trim()] = a[1].replace('"', '').trim();
                        }
                    });
                } else if (__.is.object(style)) {
                    __.fuse(self.i, style);
                }
            }
        },
        remove: function(key) {
            delete this.i[key];
        },
        set: function(key, value) {
            this.i[key] = value;
        },
        toJson: function() {
            return this.i;
        },
        toString: function() {
            var retVal = '';
            __.all(this.i, function (p, k) {
                if (p) retVal += k + '="' + p + '" ';
            });
            return retVal;
        }
    });

    // Overwrite Payload for __.fuse() deep updates, will overwrite target object/array instead of looping through it to deep copy it
    var Overwrite = __.class(function(payload) {
        this.i = payload;
        this._identifier = 'Replace Object';
    }, {
        content: function() {
            return this.i;
        }
    });

    // Configuration object with layering abilities that make extensive configs easy
    var Config = __.class(function(options) {
        this._identifier = 'Config Object';
        this._registry = {};
        this.update(options);
    }, {
        update: function(options, deep) {
            var self = this;
            if (__.is.object(options)) {
                if (options) {
                    if (deep) 
                        __.fuse(self, options, true);
                    else 
                        __.fuse(self, options);
                    __.all(self._registry, function (func, key, event) {
                        if (__.is.function(func)) 
                            func(self, options);
                    });
                }
            }
        },
        get: function(key) {
            return this[key];
        },
        set: function(key, value) {
            this[key] = value;
        },
        remove: function(key) {
            delete this[key];
        },
        handler: function(key, func) {
            if(func)
                this._registry[key] = func;
            else
                delete this._registry[key];
        }
    });

    // Simple little event manager
    var EventManager = __.class(function(events) {
        this._identifier = 'Config Object';
        this.update(events);
    }, {
        add: function(name, func) {
            var eventName = name.toLowerCase();
            if(!__.is.set(this[eventName]))
                this[eventName] = [];
            if(__.is.array(func))
                this[eventName] = this[eventName].concat(func);
            else
                this[eventName].push(func);
        },
        delegate: function(name, data, timeout) {
            var eventName = name.toLowerCase();
            var events = this[eventName];
            if(__.is.array(events)) {
                var data = { event: eventName, before: true, after: false, isCancelled: false, data: data };
                __.all(events, function(func) { setTimeout(function() { func(data); }, (timeout) ? timeout : 10); });
                return function() {
                    data.before = false;
                    data.after = true;
                    if(!data.isCancelled)
                        __.all(events, function(func) { setTimeout(function() { func(data); }, (timeout) ? timeout : 10); });
                };
            }
        },
        remove: function(name, func) {
            var eventName = name.toLowerCase();
            if(!__.is.set(func))
                delete this[eventName];
            else
                this[eventName] = __.remove(this[eventName], func);
        },
        trigger: function(name, data) {
            var eventName = name.toLowerCase();
            var events = this[eventName];
            if(__.is.array(events)) {
                var data = { event: eventName, before: true, after: false, isCancelled: false, data: data };
                __.all(events, function(func) { func(data); });
                return function() {
                    data.before = false;
                    data.after = true;
                    if(!data.isCancelled)
                        __.all(events, function(func) { func(data); });
                };
            }
        },
        update: function(options) {
            var self = this;
            if(__.is.object(options))
                __.all(options, function(x, y) { self.add(y, x); });
        }
    });

    // Event Based Stop Watch with stop, start and reset abilities along with an on tick event
    var StopWatch = __.class(function(options) {
        var self = this;
        self.lastStarted = 0;
        self.lapsedTime = 0;
        self.clock = null;
        self.settings = {
            onTick: function onTick(time) {},
            tickRate: 500
        };
        self.settings = __.flow(options).def().update(self.settings).value();

        self.update = function () {
            self.settings.onTick(self.getTime());
        };
        self.start = function () {
            self.clock = setInterval(self.update, self.settings.tickRate);
            self.lastStarted = self.lastStarted ? self.lastStarted : self.now();
        };
        self.stop = function () {
            self.lapsedTime = self.lastStarted ? self.lapsedTime + self.now() - self.lastStarted : self.lapsedTime;
            self.lastStarted = 0;
            clearInterval(self.clock);
        };
        self.reset = function () {
            self.stop();
            self.lapsedTime = self.lastStarted = 0;
            self.update();
        };
        self.getRawTime = function () {
            return self.lapsedTime + (self.lastStarted ? self.now() - self.lastStarted : 0);
        };
        self.getTime = function () {
            var h = 0,
                m = 0,
                s = 0,
                ms = 0;
            var time = self.getRawTime();

            h = Math.floor(time / (60 * 60 * 1000));
            time = time % (60 * 60 * 1000);
            m = Math.floor(time / (60 * 1000));
            time = time % (60 * 1000);
            s = Math.floor(time / 1000);
            ms = time % 1000;

            return { Hours: self.pad(h, 2), Minutes: self.pad(m, 2), Seconds: self.pad(s, 2), MilliSeconds: self.pad(ms, 3), Raw: time };
        };
        self.pad = function (num, size) {
            var s = "0000" + num;
            return s.substr(s.length - size);
        };
        self.now = function () {
            return new Date().getTime();
        };
    });

    // Ended up being a polyfill for missing object functions .keys() .values() etc but helpful
    var Enumerable = __.class(function() {}, {
        count: { 
            get: function() {
                return this.getKeys.length;
            } 
        },
        getKeys: { 
            get: function() {
                if (this.keys) return this.keys();
                return __.map(this, function (x, y) {
                    return y;
                });
            } 
        },
        getValues: { 
            get: function() {
                if (this.values) return this.values();
                return __.map(this, function (x, y) {
                    return x;
                });
            } 
        },
        each: function(func) {
            __.all(this, func);
        },
        toArray: function() {
            var ret = [];
            __.all(this, function (x, y) {
                ret[y] = x;
            });
            return ret;
        },
        toList: function() {
            return new List(this.toArray());
        },
        toDictionary: function() {
            var dict = new Dictionary();
            this.each(function(x, y) {
                dict.add(y, x);
            });
            return dict;
        }
    });

    // A significantly less efficent inheritable array class
    var List = __.class(function(items) {
        Enumerable.call(this);
        this.addRange(items);
    }, {
        add: function(item, options) {
            var hasOptions = options && options.start,
                start = hasOptions ? options.start : 0;
            while (this.hasOwnProperty(start)) {
                start++;
            }this[start] = item;
            if (hasOptions) options.start = start;
            return this;
        },
        addRange: function(items) {
            if (__.is.array(items) || items instanceof Enumerable) {
                var self = this,
                    opt = { start: 0 };
                __.all(items, function (x) {
                    return self.add(x, opt);
                });
            }
            return this;
        },
        clear: function() {
            var self = this;
            __.all(self, function (x, y) {
                delete self[y];
            });
            return self;
        },
        contains: function(func) {
            if (__.is.function(func)) 
                return __.contains(this, func);
            return __.contains(this, function (x) {
                return x == func;
            });
        },
        count: {
            get: function() {
                return this.getKeys.length;
            },
            set: function(value) {
                var count = this.count;
                if (count > value) this.removeRange(value - 1);
            }
        },
        distinct: function(func) {
            var x = this.toArray();
            x = __.distinct(x, func);
            return new List(x);
        },
        indexOf: function(item) {
            return __.search(this, function (x) {
                return x == item;
            }, { getKey: true });
        },
        insert: function(key, item) {
            var self = this,
                idx = parseInt(key),
                keys = __.sort(__.filter(__.map(this.getKeys, function (x) {
                    return parseInt(x);
                }), function (x) {
                    return x >= idx;
                }), { dir: 'desc' });
            __.all(keys, function (x) {
                self[x + 1] = self[x];
            });
            self[idx] = item;
            return this;
        },
        insertRange: function(key, items) {
            var self = this,
                idx = parseInt(key),
                count = items.length != undefined ? items.length : items.count,
                keys = __.sort(__.filter(__.map(this.getKeys, function (x) {
                return parseInt(x);
            }), function (x) {
                return x >= idx;
            }), { dir: 'desc' });
            __.all(keys, function (x) {
                self[x + count] = self[x];
            });
            __.all(items, function (x) {
                self[idx] = x;idx++;
            });
            return this;
        },
        getRange: function(start, end) {
            var self = this,
                key = 0,
                keys = __.map(self.getKeys, function (x) {
                return parseInt(x);
            }),
                begin = parseInt(start),
                end = end ? parseInt(end) : keys[keys.length - 1];
            return __.map(keys, function (x, y, z) {
                if (y >= begin && y <= end) return x;
                z.skip = true;
            });
        },
        remove: function(item) {
            var idx = this.indexOf(item);
            if (idx != null) this.removeAt(idx);
            return this;
        },
        removeAt: function(key) {
            var self = this,
                idx = parseInt(key),
                keys = __.filter(__.map(this.getKeys, function (x) {
                return parseInt(x);
            }), function (x) {
                return x > idx;
            });
            delete this[idx];
            __.all(keys, function (x) {
                return self[x - 1] = self[x];
            }); // shift all after keys down one
            delete this[keys[keys.length - 1]]; // remove tail copy
            return this;
        },
        removeRange: function(start, end) {
            var self = this,
                keys = __.map(this.getKeys, function (x) {
                return parseInt(x);
            }),
                begin = parseInt(start),
                end = end ? parseInt(end) : keys[keys.length - 1];
            __.all(__.filter(keys, function (x) {
                return x >= begin && x <= end;
            }), function (x) {
                return delete self[x];
            });
            if (end < keys[keys.length - 1]) {
                __.all(__.filter(keys, function (x) {
                    return x > end;
                }), function (x) {
                    return self[begin++] = self[x];
                });
                delete self[keys[keys.length - 1]]; // remove tail copy
            }
            return this;
        },
        search: function(func) {
            if (__.is.function(func)) 
                return __.search(this, func);
            return __.search(this, function (x) {
                return x == func;
            });
        },
        select: function(func) {
            var x = this.toArray();
            x = __.map(x, func);
            return new List(x);
        },
        sort: function(func, options) {
            var x = this.toArray();
            x = __.sort(x, options);
            var self = this;
            __.all(x, function (v, k) {
                return self[k] = x;
            });
            return this;
        },
        where: function(func) {
            var x = this.toArray();
            x = __.filter(x, func);
            return new List(x);
        },
    }, Enumerable);

    // Basic object hash table with syntactic sugar
    var Dictionary = __.class(function() {
        Enumerable.call(this);
    }, {
        add: function(key, value) {
            this[key] = value;
        },
        clear: function() {
            var self = this;
            __.all(self, function (x, y) {
                return self.remove(y);
            });
        },
        containsKey: function(key) {
            return __.is.set(this[key]);
        },
        containsValue: function(value) {
            return __.contains(this, function (x) {
                return x == value;
            });
        },
        remove: function(key) {
            delete this[key];
        }
    }, Enumerable);

    __.lib = {
        ConditionChain: ConditionChain,
        StringParser: StringParser,
        StyleParser: StyleParser,
        AttrParser: AttrParser,
        Overwrite: Overwrite,
        PrivateStore: PrivateStore,
        Config: Config,
        EventManager: EventManager,
        StopWatch: StopWatch,
        Enumerable: Enumerable,
        List: List,
        Dictionary: Dictionary
    };

    if( typeof module !== 'undefined' )
        module.exports = __;
    else if(typeof window !== 'undefined')
        window.__ = window.iterate = __;
})();