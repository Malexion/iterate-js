"use strict";

(function() {
    var __ = require('iterate-js-lite');

    __.download = function(content, fileName, type) {
        /// <summary>Downloads a file from an array of strings given a name and type.</summary>
        /// <param type="Array" name="content">Array of strings joined together for the files content.</param>
        /// <param type="String" name="fileName">Name of the file without the extension which is added on by the third param.</param>
        /// <param type="String" name="type">File type, only current choice is 'csv'.</param>
        var fileMap = {
            'csv': { ext: '.csv', encoding: 'data:application/csv;charset=utf-8', parse: function(data) { return __.is.array(data) ? data.join('') : data; } },
            'json': { ext: '.json', encoding: 'data:application/json;charset=utf-8', parse: function(data) { return __.is.string(data) ? data : JSON.stringify(data); } }
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
        this.details = {
            initialValue: value,
            value: value,
            status: true
        };
        if(__.is.object(value))
            __.fuse(this.details, value);
    }, {
        result: { get: function() { return this.details.status; } },
        all: function (func) {
            var type = __.getType(this.details.value);
            if (type == __.types.array || type == __.types.object || type == __.types.args || type == __.types.string) 
                __.all(this.details.value, func);
            return this;
        },
        append: function (value) {
            var type = __.getType(this.details.value);
            if (type == __.types.array) 
                this.details.value.push(value);
            else if (type == __.types.string && __.is.string(value)) 
                this.details.value += value;
            return this;
        },
        appendTo: function (value) {
            var type = __.getType(this.details.value);
            if (type == __.types.array) 
                this.details.value.unshift(value);
            else if (type == __.types.string && __.is.string(value)) 
                this.details.value = value + this.details.value;
            return this;
        },
        average: function (func) {
            if (__.is.array(this.details.value)) 
                this.details.value = __.math.average(this.details.value, func);
            return this;
        },
        call: function (args, chain) {
            var type = __.getType(this.details.value);
            if (type == __.types.array || type == __.types.object || type == __.types.args || type == __.types.string) 
                __.call(this.details.value, args, chain);
            return this;
        },
        contains: function (func) {
            if (this.details.status) {
                var type = __.getType(this.details.value);
                if (type == __.types.array || type == __.types.object || type == __.types.args || type == __.types.string) 
                    this.details.status = __.contains(this.details.value, func);
            }
            return this;
        },
        count: function (func) {
            var type = __.getType(this.details.value);
            if (type == __.types.array || type == __.types.object || type == __.types.args || type == __.types.string) 
                this.details.value = __.count(this.details.value);
            return this;
        },
        equals: function (value) {
            if (this.details.status) 
                this.details.status = (this.details.value == value);
            return this;
        },
        equalsExplicit: function (value) {
            if (this.details.status) 
                this.details.status = (this.details.value === value);
            return this;
        },
        evaluate: function (condition) {
            if (this.details.status && __.is.function(condition)) 
                condition(this.details);
            return this;
        },
        filter: function (func) {
            var type = __.getType(this.details.value);
            if (type == __.types.array || type == __.types.object) 
                this.details.value = __.filter(this.details.value, func);
            return this;
        },
        first: function (func, n) {
            var type = __.getType(this.details.value);
            if (type == __.types.array || type == __.types.object) 
                this.details.value = __.first(this.details.value, func, n);
            return this;
        },
        getProperty: function (propChain) {
            this.details.value = __.prop(this.details.value, propChain);
            return this;
        },
        group: function (func) {
            var type = __.getType(this.details.value);
            if (type == __.types.array || type == __.types.object) 
                this.details.value = __.group(this.details.value, func);
            return this;
        },
        then: function (func) {
            if (this.details.status) 
                func(this.details);
            return this;
        },
        else: function (func) {
            if (!this.details.status) 
                func(this.details);
            return this;
        },
        isDefined: function () {
            if (this.details.status) 
                this.details.status = __.i.defaultConditions(this.details.value);
            return this;
        },
        isSameType: function (type) {
            this.details.status = __.is.sameType(this.details.value, type);
            return this;
        },
        isSet: function () {
            if (this.details.status) 
                this.details.status = __.i.setConditions(this.details.value);
            return this;
        },
        isType: function (type) {
            this.details.status = __.getType(this.details.value) == type;
            return this;
        },
        isArgs: function() {
            this.details.status = __.is.args(this.details.value);
            return this;
        },
        isArray: function() {
            this.details.status = __.is.array(this.details.value);
            return this;
        },
        isBoolean: function() {
            this.details.status = __.is.bool(this.details.value);
            return this;
        },
        isDate: function() {
            this.details.status = __.is.date(this.details.value);
            return this;
        },
        isFunction: function() {
            this.details.status = __.is.function(this.details.value);
            return this;
        },
        isNull: function() {
            this.details.status = __.is.null(this.details.value);
            return this;
        },
        isNaN: function() {
            this.details.status = __.is.nan(this.details.value);
            return this;
        },
        isNumber: function() {
            this.details.status = __.is.number(this.details.value);
            return this;
        },
        isObject: function() {
            this.details.status = __.is.object(this.details.value);
            return this;
        },
        isString: function() {
            this.details.status = __.is.string(this.details.value);
            return this;
        },
        isUndefined: function() {
            this.details.status = __.is.undefined(this.details.value);
            return this;
        },
        last: function (func, n) {
            var type = __.getType(this.details.value);
            if (type == __.types.array || type == __.types.object) 
                this.details.value = __.last(this.details.value, func, n);
            return this;
        },
        map: function (func, options) {
            var type = __.getType(this.details.value);
            if (type == __.types.array || type == __.types.object) 
                this.details.value = __.map(this.details.value, func, options);
            return this;
        },
        max: function (func) {
            if (__.is.array(this.details.value)) 
                this.details.value = __.math.max(this.details.value, func);
            return this;
        },
        median: function (func) {
            if (__.is.array(this.details.value)) 
                this.details.value = __.math.max(this.details.value, func);
            return this;
        },
        min: function (func) {
            if (__.is.array(this.details.value)) 
                this.details.value = __.math.min(this.details.value, func);
            return this;
        },
        search: function (func, options) {
            var type = __.getType(this.details.value);
            if (type == __.types.array || type == __.types.object || type == __.types.args || type == __.types.string) 
                this.details.value = __.search(this.details.value, func, options);
            return this;
        },
        sort: function (options) {
            var type = __.getType(this.details.value);
            if (type == __.types.array || type == __.types.object) 
                this.details.value = __.sort(this.details.value, options);
            return this;
        },
        sum: function (func) {
            if (__.is.array(this.details.value)) 
                this.details.value = __.math.sum(this.details.value, func);
            return this;
        },
        value: function (def) {
            if (!this.details.status && def != undefined) 
                return def;
            return this.details.value;
        },
        update: function (defaultObj) {
            if (this.details.status) 
                this.details.value = __.fuse(defaultObj, this.details.value);
            else 
                this.details.value = defaultObj;
            return this;
        }
    });

    // Base for creating a string parser
    var StringParser = __.class(function(keywords, options) {
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
                options = __.flow(self.options)
                            .isSet()
                            .update({ skip: 0, bubble: true, ignoreCase: true, defaultAction: function() {  } })
                            .value(),
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
                if (__.is.function(func)) {
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

    // Base for __.fuse object.update() classes
    var Updatable = __.class(function() {}, {
        _identifier: {
            get: function() {
                return 'Config Object';
            }
        },
        update: function() {}
    });

    // Parsing element style params from json to string and vise versa
    var StyleParser = __.class(function(options) {
        Updatable.call(this);
        this.update(options);
    }, {
        asObject: {
            get: function() {
                return __.map(this, function(x, y, z) {
                    if(y == '_identifier')
                        z.skip = true;
                    return { key: y, value: x };
                }, { build: {} });
            }
        },
        asString: {
            get: function() {
                var retVal = '';
                __.all(this, function (p, k) {
                    if (p && k != '_identifier') 
                        retVal += '{0}:{1};'.format(k, p);
                });
                return retVal;
            }
        },
        clear: function() {
            var self = this;
            __.all(self, function(x, y) {
                if(y != '_identifier')
                    self.remove(y);
            });
        },
        remove: function(property) {
            delete this[property];
        },
        update: function(options) {
            var self = this;
            if(__.is.string(options)) {
                var values = options.split(';');
                __.all(values, function (p) {
                    if (p != "") {
                        var a = p.split(/:(.+)/);
                        self[a[0].trim()] = a[1].trim();
                    }
                });
            } else if(__.is.object(options))
                __.fuse(self, options);
        }
    }, Updatable);

    // Parsing attribute params from json to string and vise versa
    var AttrParser = __.class(function(options) {
        Updatable.call(this);
        this.update(options);
    }, {
        asObject: {
            get: function() {
                return __.map(this, function(x, y, z) {
                    if(y == '_identifier')
                        z.skip = true;
                    return { key: y, value: x };
                }, { build: {} });
            }
        },
        asString: {
            get: function() {
                var retVal = '';
                __.all(this, function (p, k) {
                    if (p && k != '_identifier') 
                        retVal += '{0}="{1}" '.format(k, p);
                });
                return retVal;
            }
        },
        clear: function() {
            var self = this;
            __.all(self, function(x, y) {
                if(y != '_identifier')
                    self.remove(y);
            });
        },
        remove: function(property) {
            delete this[property];
        },
        update: function(options) {
            var self = this;
            if(__.is.string(options)) {
                var values = style.split(' ');
                __.all(values, function (p) {
                    if (p != "") {
                        var a = p.split('=');
                        self[a[0].trim()] = a[1].replace('"', '').trim();
                    }
                });
            } else if(__.is.object(options))
                __.fuse(self, options);
        }
    }, Updatable);

    // Configuration object with layering abilities that make extensive configs easy
    var Config = __.class(function(options) {
        Updatable.call(this);
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
        clear: function() {
            var self = this;
            __.all(self, function(x, y) {
                if(y != '_registry' && y != '_identifier')
                    delete self[y];
            });
        },
        handler: function(key, func) {
            if(func)
                this._registry[key] = func;
            else
                delete this._registry[key];
        }
    }, Updatable);

    // Simple little event manager
    var EventManager = __.class(function(events) {
        Updatable.call(this);
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
    }, Updatable);

    // Simple little view manager, great for Aurelia tabbed nav/dropdown control management
    var ViewManager = __.class(function(options) {
        Updatable.call(this);
        this._active = null;
        this.views = [];
        this.onViewChange = function(view) {};
        this.update(options);
        var def = this.defaultView;
        if(def)
            this.activeView = def;
    }, {
        activeView: {
            get: function() {
                return this._active;
            },
            set: function(view) {
                if(view) {
                    __.all(this.views, x => x.active = (x.name == view.name));
                    this._active = view;
                    this.onViewChange(view);
                }
            }
        },
        defaultView: {
            get: function() {
                return __.search(this.views, x => x.default);
            }
        },
        getView: function(name) {
            return __.search(this.views, x => x.name == name);
        },
        setView: function(name) {
            this.activeView = this.getView(name);
        },
        update: function(options) {
            if(__.is.object(options))
                __.fuse(this, options);
        }
    }, Updatable);

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
        if(__.is.object(options))
            __.fuse(self.settings, options);

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
                if (this.keys) 
                    return this.keys();
                return __.map(this, function (x, y) {
                    return y;
                });
            } 
        },
        getValues: { 
            get: function() {
                if (this.values) 
                    return this.values();
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
            return __.is.contains(this.getKeys, function(x) { return x == key; });
        },
        containsValue: function(value) {
            return __.contains(this, function (x) { return x == value; });
        },
        remove: function(key) {
            delete this[key];
        }
    }, Enumerable);
    
    __.fuse(__.lib, {
        ConditionChain: ConditionChain,
        StringParser: StringParser,
        Updatable: Updatable,
        StyleParser: StyleParser,
        AttrParser: AttrParser,
        PrivateStore: PrivateStore,
        Config: Config,
        EventManager: EventManager,
        ViewManager: ViewManager,
        StopWatch: StopWatch,
        Enumerable: Enumerable,
        List: List,
        Dictionary: Dictionary
    });

    if( typeof module !== 'undefined' )
        module.exports = __;
    else if(typeof window !== 'undefined')
        window.__ = window.iterate = __;
})();