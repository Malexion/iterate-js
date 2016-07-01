"use strict";

(function () {
    var __ = require('iterate-js-lite');

    __.download = function (content, fileName, type) {
        /// <summary>Downloads a file from an array of strings given a name and type.</summary>
        /// <param type="Array" name="content">Array of strings joined together for the files content.</param>
        /// <param type="String" name="fileName">Name of the file without the extension which is added on by the third param.</param>
        /// <param type="String" name="type">File type, only current choice is 'csv'.</param>
        var fileMap = {
            'csv': { ext: '.csv', encoding: 'data:application/csv;charset=utf-8', parse: function parse(data) {
                    return __.is.array(data) ? data.join('') : data;
                } },
            'json': { ext: '.json', encoding: 'data:application/json;charset=utf-8', parse: function parse(data) {
                    return __.is.string(data) ? data : JSON.stringify(data);
                } }
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
    __.flow = function (obj) {
        /// <summary> Returns a ConditionChain object with additional function and operations based on the type of object passed in.</summary>
        /// <param type="Value" name="obj">Value to be checked and evaluated.</param>
        /// <returns type="ConditionChain">A chain object, which contains many different functions, to get the boolean result simply call [chain].result. For more see the ConditionChain class.</returns>

        return new ConditionChain({ initialValue: obj, value: obj });
    };
    __.render = {
        blend: function blend(c0, c1, p) {
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
        bytesToImageSrc: function bytesToImageSrc(bytes, type) {
            // el.src = __.render.bytesToImage( [ byteArrayFromServer ].join('') );
            return "data:image/{0};base64,{1}".format(type ? type : 'png', bytes);
        },
        bytesToCanvas: function bytesToCanvas(bytes, type, canvas, coords) {
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

    // Wrapper for weakmap for simplistic private variable management
    var PrivateStore = __.class(function () {
        this.map = new WeakMap();
    }, {
        context: function context(_context, func) {
            return func(this.map.get(_context));
        },
        bind: function bind(context, data) {
            this.map.set(context, __.is.object(data) ? data : {});
        },
        get: function get(context, path) {
            return __.prop(this.map.get(context), path);
        },
        set: function set(context, path, value) {
            var paths = path.split('.');
            if (paths.length > 0) {
                var fragment = paths.pop(),
                    obj = this.map.get(context);
                __.all(paths, function (x) {
                    if (!__.is.set(obj[x])) obj[x] = {};
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
        result: { get: function get() {
                return this.details.status;
            } },
        all: function all(func) {
            var type = __.getType(this.details.value);
            if (type == __.types.array || type == __.types.object || type == __.types.args || type == __.types.string) __.all(this.details.value, func);
            return this;
        },
        append: function append(value) {
            var type = __.getType(this.details.value);
            if (type == __.types.array) this.details.value.push(value);else if (type == __.types.string && __.is.string(value)) this.details.value += value;
            return this;
        },
        appendTo: function appendTo(value) {
            var type = __.getType(this.details.value);
            if (type == __.types.array) this.details.value.unshift(value);else if (type == __.types.string && __.is.string(value)) this.details.value = value + this.details.value;
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
    var StringParser = __.class(function (keywords, defaultAction, options) {
        var keyChars = {},
            keyWords = {};

        __.all(keywords, function (x, y) {
            if (y.length > 1) keyWords[y] = x;else keyChars[y] = x;
        });

        this.keyChars = keyChars;
        this.keyWords = keyWords;
        this.options = options ? options : {};
    }, {
        parse: function parse(str) {
            var self = this,
                options = __.flow(self.options).set().update({ skip: 0, bubble: true, ignoreCase: true, defaultAction: function defaultAction() {} }).value(),
                char = '',
                idx = 0,
                func = function func() {},
                called = false;

            __.all(str, function (a, b) {
                if (options.skip > 0) return options.skip--;
                options.bubble = true;
                called = false;
                char = a;
                idx = parseInt(b);

                func = self.keyChars[char];
                if (func != undefined) {
                    func(char, idx, str, options);
                    called = true;
                }
                __.all(self.keyWords, function (x, y) {
                    if (options.bubble || !called) {
                        if ((y[0] && options.ignoreCase ? y[0].toLowerCase() : y[0]) == (char && options.ignoreCase ? char.toLowerCase() : char)) {
                            var pass = true;
                            var comp = '';
                            __.all(y, function (c, d) {
                                comp = str[idx + parseInt(d)];
                                if ((c && options.ignoreCase ? c.toLowerCase() : c) != (comp && options.ignoreCase ? comp.toLowerCase() : comp)) pass = false;
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
                if (!called) options.defaultAction(char, idx, str, options);
            });
        }
    });

    // Parsing element style params from json to string and vise versa
    var StyleParser = __.class(function (obj) {
        this.i = {};
        this.merge(obj);
    }, {
        clear: function clear() {
            this.i = {};
        },
        get: function get(key) {
            this.i[key];
        },
        merge: function merge(style) {
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
        remove: function remove(key) {
            delete this.i[key];
        },
        set: function set(key, value) {
            this.i[key] = value;
        },
        toJson: function toJson() {
            return this.i;
        },
        toString: function toString() {
            var retVal = '';
            __.all(this.i, function (p, k) {
                if (p) retVal += k + ':' + p + ';';
            });
            return retVal;
        }
    });

    // Parsing attribute params from json to string and vise versa
    var AttrParser = __.class(function (obj) {
        this.i = {};
        this.merge(obj);
    }, {
        clear: function clear() {
            this.i = {};
        },
        get: function get(key) {
            this.i[key];
        },
        merge: function merge(style) {
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
        remove: function remove(key) {
            delete this.i[key];
        },
        set: function set(key, value) {
            this.i[key] = value;
        },
        toJson: function toJson() {
            return this.i;
        },
        toString: function toString() {
            var retVal = '';
            __.all(this.i, function (p, k) {
                if (p) retVal += k + '="' + p + '" ';
            });
            return retVal;
        }
    });

    // Configuration object with layering abilities that make extensive configs easy
    var Config = __.class(function (options) {
        this._identifier = 'Config Object';
        this._registry = {};
        this.update(options);
    }, {
        update: function update(options, deep) {
            var self = this;
            if (__.is.object(options)) {
                if (options) {
                    if (deep) __.fuse(self, options, true);else __.fuse(self, options);
                    __.all(self._registry, function (func, key, event) {
                        if (__.is.function(func)) func(self, options);
                    });
                }
            }
        },
        get: function get(key) {
            return this[key];
        },
        set: function set(key, value) {
            this[key] = value;
        },
        remove: function remove(key) {
            delete this[key];
        },
        handler: function handler(key, func) {
            if (func) this._registry[key] = func;else delete this._registry[key];
        }
    });

    // Simple little event manager
    var EventManager = __.class(function (events) {
        this._identifier = 'Config Object';
        this.update(events);
    }, {
        add: function add(name, func) {
            var eventName = name.toLowerCase();
            if (!__.is.set(this[eventName])) this[eventName] = [];
            if (__.is.array(func)) this[eventName] = this[eventName].concat(func);else this[eventName].push(func);
        },
        delegate: function delegate(name, data, timeout) {
            var eventName = name.toLowerCase();
            var events = this[eventName];
            if (__.is.array(events)) {
                var data = { event: eventName, before: true, after: false, isCancelled: false, data: data };
                __.all(events, function (func) {
                    setTimeout(function () {
                        func(data);
                    }, timeout ? timeout : 10);
                });
                return function () {
                    data.before = false;
                    data.after = true;
                    if (!data.isCancelled) __.all(events, function (func) {
                        setTimeout(function () {
                            func(data);
                        }, timeout ? timeout : 10);
                    });
                };
            }
        },
        remove: function remove(name, func) {
            var eventName = name.toLowerCase();
            if (!__.is.set(func)) delete this[eventName];else this[eventName] = __.remove(this[eventName], func);
        },
        trigger: function trigger(name, data) {
            var eventName = name.toLowerCase();
            var events = this[eventName];
            if (__.is.array(events)) {
                var data = { event: eventName, before: true, after: false, isCancelled: false, data: data };
                __.all(events, function (func) {
                    func(data);
                });
                return function () {
                    data.before = false;
                    data.after = true;
                    if (!data.isCancelled) __.all(events, function (func) {
                        func(data);
                    });
                };
            }
        },
        update: function update(options) {
            var self = this;
            if (__.is.object(options)) __.all(options, function (x, y) {
                self.add(y, x);
            });
        }
    });

    // Event Based Stop Watch with stop, start and reset abilities along with an on tick event
    var StopWatch = __.class(function (options) {
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
    var Enumerable = __.class(function () {}, {
        count: {
            get: function get() {
                return this.getKeys.length;
            }
        },
        getKeys: {
            get: function get() {
                if (this.keys) return this.keys();
                return __.map(this, function (x, y) {
                    return y;
                });
            }
        },
        getValues: {
            get: function get() {
                if (this.values) return this.values();
                return __.map(this, function (x, y) {
                    return x;
                });
            }
        },
        each: function each(func) {
            __.all(this, func);
        },
        toArray: function toArray() {
            var ret = [];
            __.all(this, function (x, y) {
                ret[y] = x;
            });
            return ret;
        },
        toList: function toList() {
            return new List(this.toArray());
        },
        toDictionary: function toDictionary() {
            var dict = new Dictionary();
            this.each(function (x, y) {
                dict.add(y, x);
            });
            return dict;
        }
    });

    // A significantly less efficent inheritable array class
    var List = __.class(function (items) {
        Enumerable.call(this);
        this.addRange(items);
    }, {
        add: function add(item, options) {
            var hasOptions = options && options.start,
                start = hasOptions ? options.start : 0;
            while (this.hasOwnProperty(start)) {
                start++;
            }this[start] = item;
            if (hasOptions) options.start = start;
            return this;
        },
        addRange: function addRange(items) {
            if (__.is.array(items) || items instanceof Enumerable) {
                var self = this,
                    opt = { start: 0 };
                __.all(items, function (x) {
                    return self.add(x, opt);
                });
            }
            return this;
        },
        clear: function clear() {
            var self = this;
            __.all(self, function (x, y) {
                delete self[y];
            });
            return self;
        },
        contains: function contains(func) {
            if (__.is.function(func)) return __.contains(this, func);
            return __.contains(this, function (x) {
                return x == func;
            });
        },
        count: {
            get: function get() {
                return this.getKeys.length;
            },
            set: function set(value) {
                var count = this.count;
                if (count > value) this.removeRange(value - 1);
            }
        },
        distinct: function distinct(func) {
            var x = this.toArray();
            x = __.distinct(x, func);
            return new List(x);
        },
        indexOf: function indexOf(item) {
            return __.search(this, function (x) {
                return x == item;
            }, { getKey: true });
        },
        insert: function insert(key, item) {
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
        insertRange: function insertRange(key, items) {
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
        getRange: function getRange(start, end) {
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
        remove: function remove(item) {
            var idx = this.indexOf(item);
            if (idx != null) this.removeAt(idx);
            return this;
        },
        removeAt: function removeAt(key) {
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
        removeRange: function removeRange(start, end) {
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
        search: function search(func) {
            if (__.is.function(func)) return __.search(this, func);
            return __.search(this, function (x) {
                return x == func;
            });
        },
        select: function select(func) {
            var x = this.toArray();
            x = __.map(x, func);
            return new List(x);
        },
        sort: function sort(func, options) {
            var x = this.toArray();
            x = __.sort(x, options);
            var self = this;
            __.all(x, function (v, k) {
                return self[k] = x;
            });
            return this;
        },
        where: function where(func) {
            var x = this.toArray();
            x = __.filter(x, func);
            return new List(x);
        }
    }, Enumerable);

    // Basic object hash table with syntactic sugar
    var Dictionary = __.class(function () {
        Enumerable.call(this);
    }, {
        add: function add(key, value) {
            this[key] = value;
        },
        clear: function clear() {
            var self = this;
            __.all(self, function (x, y) {
                return self.remove(y);
            });
        },
        containsKey: function containsKey(key) {
            return __.is.set(this[key]);
        },
        containsValue: function containsValue(value) {
            return __.contains(this, function (x) {
                return x == value;
            });
        },
        remove: function remove(key) {
            delete this[key];
        }
    }, Enumerable);

    __.lib.ConditionChain = ConditionChain;
    __.lib.StringParser = StringParser;
    __.lib.StyleParser = StyleParser;
    __.lib.AttrParser = AttrParser;
    __.lib.PrivateStore = PrivateStore;
    __.lib.Config = Config;
    __.lib.EventManager = EventManager;
    __.lib.StopWatch = StopWatch;
    __.lib.Enumerable = Enumerable;
    __.lib.List = List;
    __.lib.Dictionary = Dictionary;

    if (typeof module !== 'undefined') module.exports = __;else if (typeof window !== 'undefined') window.__ = window.iterate = __;
})();