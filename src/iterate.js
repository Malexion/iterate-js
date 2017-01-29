﻿"use strict";

(function() {
    var __ = require('iterate-js-lite');

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
        distinct: function(func) {
            var type = __.getType(this.details.value);
            if (type == __.types.array || type == __.types.object) 
                this.details.value = __.distinct(this.details.value, func);
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
        first: function (options) {
            var type = __.getType(this.details.value);
            if (type == __.types.array || type == __.types.object) 
                this.details.value = __.first(this.details.value, options);
            return this;
        },
        prop: function (propChain) {
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
        intersect: function(obj, func) {
            var type = __.getType(this.details.value);
            if (type == __.types.array || type == __.types.object) 
                this.details.value = __.intersect(this.details.value, obj, func);
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
        last: function (options) {
            var type = __.getType(this.details.value);
            if (type == __.types.array || type == __.types.object) 
                this.details.value = __.last(this.details.value, options);
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
                options = __.options({ skip: 0, bubble: true, ignoreCase: true, defaultAction: function() {  } }),
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

    // Parsing element style params from json to string and vise versa
    var StyleParser = __.class(function(options) {
        __.lib.Updatable.call(this);
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
    }, __.lib.Updatable);

    // Parsing attribute params from json to string and vise versa
    var AttrParser = __.class(function(options) {
        __.lib.Updatable.call(this);
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
    }, __.lib.Updatable);

    // Configuration object with layering abilities that make extensive configs easy
    var Config = __.class(function(options) {
        __.lib.Updatable.call(this);
        this._registry = {};
        this.update(options);
    }, {
        update: function(options, deep) {
            var self = this;
            if (__.is.object(options)) {
                __.fuse(self, options, { deep: Boolean(deep) });
                __.all(self._registry, function (func, key, event) {
                    if (__.is.function(func)) 
                        func(self, options);
                });
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
    }, __.lib.Updatable);

    // Simple little event manager
    var EventManager = __.class(function(events) {
        __.lib.Updatable.call(this);
        this.hooks = {};
        this.update(events);
    }, {
        add: function(name, func) {
            var eventName = name.toLowerCase();
            if(!__.is.set(this.hooks[eventName]))
                this.hooks[eventName] = [];
            if(__.is.array(func))
                this.hooks[eventName] = this.hooks[eventName].concat(func);
            else
                this.hooks[eventName].push(func);
        },
        delegate: function(name, data, timeout) {
            var eventName = name.toLowerCase();
            var events = this.hooks[eventName];
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
        on: function(name, func) {
            this.add(name, func);
        },
        off: function(name, func) {
            this.remove(name, func);
        },
        read: function(obj) {
            var str = '',
                self = this;

            __.all(obj, (func, key) => {
                str = key.toLowerCase();

                if(str.substring(0, 2) == 'on' && str != 'on' && __.is.function(func))
                    self.add(str.replace('on', ''), func.bind(obj));
            }, true);
        },
        remove: function(name, func) {
            if(name) {
                var eventName = name.toLowerCase();
                if(!__.is.set(func))
                    delete this.hooks[eventName];
                else
                    this.hooks[eventName] = __.remove(this.hooks[eventName], func);
            } else {
                var self = this;
                __.all(self, function(func, key) { delete self.hooks[key]; });
            }
        },
        trigger: function(name, data) {
            var eventName = name.toLowerCase();
            var events = this.hooks[eventName];
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
            return function() {};
        },
        update: function(options) {
            var self = this;
            if(__.is.object(options))
                __.all(options, function(x, y) { self.add(y, x); });
        }
    }, __.lib.Updatable);

    // Simple little view manager, great for Aurelia tabbed nav/dropdown control management
    var ViewManager = __.class(function(options) {
        __.lib.Updatable.call(this);
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
                    __.all(this.views, function(x) { x.active = (x.name == view.name); });
                    this._active = view;
                    this.onViewChange(view);
                }
            }
        },
        defaultView: {
            get: function() {
                return __.search(this.views, function(x) { return x.default; });
            }
        },
        getView: function(name) {
            return __.search(this.views, function(x) { return x.name == name; });
        },
        setView: function(name) {
            this.activeView = this.getView(name);
        },
        update: function(options) {
            if(__.is.object(options))
                __.fuse(this, options);
        }
    }, __.lib.Updatable);

    // Simple object template engine, ties any object functions this context to the templated object as well
    var Model = __.class(function(defaults) {
        this.defaults = defaults;
    }, {
        all: function(obj) {
            var self = this;
            return __.map(obj, function(x) { return self.create(x); });
        },
        create: function(options) {
            var model = __.fuse(this.cloneDefaults(), options);
            __.all(model, function(value, key) {
                if(__.is.function(value))
                    model[key] = value.bind(model); // Configure this context
            });
            return model;
        },
        cloneDefaults: function() {
            return __.fuse({}, this.defaults, { deep: true });
        }
    });

    // Experimental Interface for aurelia binding a more controlled array: this.manager = new __.lib.ArrayManager();  <div repeat.for="item of manager.array"></div>
    var ArrayManager = __.class(function(options) {
        var self = this;
        self.array = [];
        self.config = __.options({
            array: [],
            multiselect: false,
            selection: null,
            map: undefined,
            filter: undefined,
            sort: undefined,
            debounce: 50
        }, options);

        self.filters = {
            limit: function(limit) {
                var target = limit;
                return function(x, y, z) {
                    if(z.count == undefined)
                        z.count = 0;
                    z.count++;
                    if(z.count == target)
                        z.skip = z.stop = true;
                    return x;
                };
            },
            selected: function() {
                return function(x, y, z) {
                    if(!x.selected)
                        z.skip = true;
                    return x;
                }
            },
            hidden: function() {
                return function(x, y, z) {
                    if(x.hidden)
                        z.skip = true;
                    return x;
                }
            }
        };

        var refresh = () => {
            var temp = self.config.array;
            if(__.is.set(self.config.sort))
                temp = __.sort(temp, self.config.sort);
            if(__.is.set(self.config.filter))
                temp = __.filter(temp, self.config.filter);
            if(__.is.set(self.config.map))
                temp = __.map(temp, self.config.map);
            self.array = temp;
        };

        self.refresh = self.config.debounce == 0 ? refresh : __.debounce(refresh, self.config.debounce);
        self.refresh();
    }, {
        add: function(item) {
            if(__.is.array(item))
                this.config.array = this.config.array.slice().concat(item);
            else
                this.config.array.push(item);
            this.refresh();
        },
        addAt: function(item, index) {
            if(__.is.array(item))
                Array.prototype.splice.apply(this.config.array, [ index, 0 ].concat(item));
            else
                this.config.array.splice(index, 0, item);
            this.refresh();
        },
        clear: function() {
            this.array = [];
            this.config.array = [];
        },
        contains: function(func) {
            if(__.is.function(func))
                return __.contains(this.array.slice(), func);
            return false;
        },
        count: { 
            get: function() { 
                return this.array.length; 
            } 
        },
        filter: function(func) {
            if(__.is.function(func))
                this.config.filter = func;
            else
                this.config.filter = undefined;
            this.refresh();
        },
        indexOf: function(item) {
            return this.array.indexOf(item);
        },
        map: function(func) {
            if(__.is.function(func))
                this.config.map = func;
            else
                this.config.map = undefined;
            this.refresh();
        },
        remove: function(item) {
            var idx = this.indexOf(item);
            if(idx > -1)
                this.removeAt(idx);
        },
        removeAt: function(index) {
            this.config.array = this.config.array.slice().splice(index, 1);
            this.refresh();
        },
        search: function(func) {
            return __.search(this.array.slice(), func);
        },
        sort: function(options) {
            if(__.is.set(options))
                this.config.sort = options;
            else
                this.config.sort = undefined;
            this.refresh();
        },
        select: function(items) {
            if(!this.multiselect)
                __.all(this.array.slice(), x => x.selected = false);

            if(__.is.array(items))
                __.all(items, x => x.selected = true);
            else if(__.is.object(items))
                items.selected = true;

            this.config.selection = __[this.multiselect ? 'filter':'search'](this.array.slice(), x => x.selected);
        },
        unselect: function(items) {
            if(!this.multiselect)
                __.all(this.array.slice(), x => x.selected = false);

            if(__.is.array(items))
                __.all(items, x => x.selected = false);
            else if(__.is.object(items))
                items.selected = false;

            this.config.selection = __[this.multiselect ? 'filter':'search'](this.array.slice(), x => x.selected);
        },
        update: function(options) {
            if(__.is.array(options))
                this.config.array = options;
            else if(__.is.object(options))
                __.fuse(this.config, options);
            this.refresh();
        }
    }, __.lib.Updatable);

    // Event Based Stop Watch with stop, start and reset abilities along with an on tick event
    var StopWatch = __.class(function(options) {
        var self = this;
        self.lastStarted = 0;
        self.lapsedTime = 0;
        self.clock = null;
        self.settings = __.options({
            onTick: function onTick(time) {},
            tickRate: 500
        }, options);

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

    // Extendable array base
    var arrayStore = new PrivateStore();
    var ArrayExt = __.class(function() {
        arrayStore.bind(this);
        arrayStore.context(this, function(store) {
            store.length = 0;
        });
        Array.call(this);
        var self = this,
            process = arguments;
        if(__.is.array(arguments[0]))
            process = arguments[0];
        __.all(process, function(x) { self.push(x); });
    }, {
        length: { 
            get: function() { 
                return arrayStore.get(this, 'length'); 
            },
            set: function(value) {
                arrayStore.set(this, 'length', value); 
            }
        }
    }, Array);

    // Ended up being a polyfill for missing object functions .keys() .values() etc but helpful
    var Enumerable = __.class(function() {}, {
        count: { 
            get: function() {
                return this.getKeys.length;
            } 
        },
        getKeys: { 
            get: function() {
                if (Object.keys) 
                    return Object.keys(this);
                return __.map(this, function (x, y) {
                    return y;
                });
            } 
        },
        getValues: { 
            get: function() {
                if (Object.values) 
                    return Object.values(this);
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
        StyleParser: StyleParser,
        AttrParser: AttrParser,
        PrivateStore: PrivateStore,
        Config: Config,
        Model: Model,
        EventManager: EventManager,
        ViewManager: ViewManager,
        ArrayManager: ArrayManager,
        StopWatch: StopWatch,
        ArrayExt: ArrayExt,
        Enumerable: Enumerable,
        Dictionary: Dictionary
    });

    if( typeof module !== 'undefined' )
        module.exports = __;
    else if(typeof window !== 'undefined')
        window.__ = window.iterate = __;
})();