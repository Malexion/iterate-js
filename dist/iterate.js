"use strict";!function(){var t=require("iterate-js-lite");t.flow=function(t){return new e({initialValue:t,value:t})},t.render={blend:function(t,i,e){var s=parseInt(t.slice(1),16),a=parseInt(i.slice(1),16),n=s>>16,r=s>>8&255,u=255&s,l=a>>16,o=a>>8&255,c=255&a;return"#"+(16777216+65536*(Math.round((l-n)*e)+n)+256*(Math.round((o-r)*e)+r)+(Math.round((c-u)*e)+u)).toString(16).slice(1)},bytesToImageSrc:function(t,i){return"data:image/{0};base64,{1}".format(i?i:"png",t)},bytesToCanvas:function(t,i,e,s){for(var a=e.getContext("2d"),n=t,r=n.length,u=[r];r--;)u[r]=String.fromCharCode(n[r]);var l=u.join(""),o=window.btoa(l),c=new Image;c.src="data:image/{0};base64,{1}".format(i?i:"png",o),c.onload=function(){console.log("Image Onload"),a.drawImage(c,s[0],s[1],e.width,e.height)},c.onerror=function(t){console.log("Img Onerror:",t)}}};var i=t["class"](function(){this.map=new WeakMap},{context:function(t,i){return i(this.map.get(t))},bind:function(i,e){this.map.set(i,t.is.object(e)?e:{})},get:function(i,e){return t.prop(this.map.get(i),e)},set:function(i,e,s){var a=e.split(".");if(a.length>0){var n=a.pop(),r=this.map.get(i);t.all(a,function(i){t.is.set(r[i])||(r[i]={}),r=r[i]}),r[n]=s}}}),e=t["class"](function(i){this.details={initialValue:i,value:i,status:!0},t.is.object(i)&&t.fuse(this.details,i)},{result:{get:function(){return this.details.status}},all:function(i){var e=t.getType(this.details.value);return e!=t.types.array&&e!=t.types.object&&e!=t.types.args&&e!=t.types.string||t.all(this.details.value,i),this},append:function(i){var e=t.getType(this.details.value);return e==t.types.array?this.details.value.push(i):e==t.types.string&&t.is.string(i)&&(this.details.value+=i),this},appendTo:function(i){var e=t.getType(this.details.value);return e==t.types.array?this.details.value.unshift(i):e==t.types.string&&t.is.string(i)&&(this.details.value=i+this.details.value),this},average:function(i){return t.is.array(this.details.value)&&(this.details.value=t.math.average(this.details.value,i)),this},contains:function(i){if(this.details.status){var e=t.getType(this.details.value);e!=t.types.array&&e!=t.types.object&&e!=t.types.args&&e!=t.types.string||(this.details.status=t.contains(this.details.value,i))}return this},count:function(i){var e=t.getType(this.details.value);return e!=t.types.array&&e!=t.types.object&&e!=t.types.args&&e!=t.types.string||(this.details.value=t.count(this.details.value)),this},distinct:function(i){var e=t.getType(this.details.value);return e!=t.types.array&&e!=t.types.object||(this.details.value=t.distinct(this.details.value,i)),this},equals:function(t){return this.details.status&&(this.details.status=this.details.value==t),this},equalsExplicit:function(t){return this.details.status&&(this.details.status=this.details.value===t),this},evaluate:function(i){return this.details.status&&t.is["function"](i)&&i(this.details),this},filter:function(i){var e=t.getType(this.details.value);return e!=t.types.array&&e!=t.types.object||(this.details.value=t.filter(this.details.value,i)),this},first:function(i){var e=t.getType(this.details.value);return e!=t.types.array&&e!=t.types.object||(this.details.value=t.first(this.details.value,i)),this},prop:function(i){return this.details.value=t.prop(this.details.value,i),this},group:function(i){var e=t.getType(this.details.value);return e!=t.types.array&&e!=t.types.object||(this.details.value=t.group(this.details.value,i)),this},then:function(t){return this.details.status&&t(this.details),this},"else":function(t){return this.details.status||t(this.details),this},intersect:function(i,e){var s=t.getType(this.details.value);return s!=t.types.array&&s!=t.types.object||(this.details.value=t.intersect(this.details.value,i,e)),this},isDefined:function(){return this.details.status&&(this.details.status=t.i.defaultConditions(this.details.value)),this},isSameType:function(i){return this.details.status=t.is.sameType(this.details.value,i),this},isSet:function(){return this.details.status&&(this.details.status=t.i.setConditions(this.details.value)),this},isType:function(i){return this.details.status=t.getType(this.details.value)==i,this},isArgs:function(){return this.details.status=t.is.args(this.details.value),this},isArray:function(){return this.details.status=t.is.array(this.details.value),this},isBoolean:function(){return this.details.status=t.is.bool(this.details.value),this},isDate:function(){return this.details.status=t.is.date(this.details.value),this},isFunction:function(){return this.details.status=t.is["function"](this.details.value),this},isNull:function(){return this.details.status=t.is["null"](this.details.value),this},isNaN:function(){return this.details.status=t.is.nan(this.details.value),this},isNumber:function(){return this.details.status=t.is.number(this.details.value),this},isObject:function(){return this.details.status=t.is.object(this.details.value),this},isString:function(){return this.details.status=t.is.string(this.details.value),this},isUndefined:function(){return this.details.status=t.is.undefined(this.details.value),this},last:function(i){var e=t.getType(this.details.value);return e!=t.types.array&&e!=t.types.object||(this.details.value=t.last(this.details.value,i)),this},map:function(i,e){var s=t.getType(this.details.value);return s!=t.types.array&&s!=t.types.object||(this.details.value=t.map(this.details.value,i,e)),this},max:function(i){return t.is.array(this.details.value)&&(this.details.value=t.math.max(this.details.value,i)),this},median:function(i){return t.is.array(this.details.value)&&(this.details.value=t.math.max(this.details.value,i)),this},min:function(i){return t.is.array(this.details.value)&&(this.details.value=t.math.min(this.details.value,i)),this},search:function(i,e){var s=t.getType(this.details.value);return s!=t.types.array&&s!=t.types.object&&s!=t.types.args&&s!=t.types.string||(this.details.value=t.search(this.details.value,i,e)),this},sort:function(i){var e=t.getType(this.details.value);return e!=t.types.array&&e!=t.types.object||(this.details.value=t.sort(this.details.value,i)),this},sum:function(i){return t.is.array(this.details.value)&&(this.details.value=t.math.sum(this.details.value,i)),this},value:function(t){return this.details.status||void 0==t?this.details.value:t},update:function(i){return this.details.status?this.details.value=t.fuse(i,this.details.value):this.details.value=i,this}}),s=t["class"](function(i,e){var s={},a={};t.all(i,function(t,i){i.length>1?a[i]=t:s[i]=t}),this.keyChars=s,this.keyWords=a,this.options=e?e:{}},{parse:function(i){var e=this,s=t.options({skip:0,bubble:!0,ignoreCase:!0,defaultAction:function(){}}),a="",n=0,r=function(){},u=!1;t.all(i,function(l,o){return s.skip>0?s.skip--:(s.bubble=!0,u=!1,a=l,n=parseInt(o),r=e.keyChars[a],t.is["function"](r)&&(r(a,n,i,s),u=!0),t.all(e.keyWords,function(e,l){if((s.bubble||!u)&&(l[0]&&s.ignoreCase?l[0].toLowerCase():l[0])==(a&&s.ignoreCase?a.toLowerCase():a)){var o=!0,c="";t.all(l,function(t,e){c=i[n+parseInt(e)],(t&&s.ignoreCase?t.toLowerCase():t)!=(c&&s.ignoreCase?c.toLowerCase():c)&&(o=!1)}),o&&(r=e,void 0!=r&&(s.skip=l.length-1,r(l,n,i,s),u=!0))}}),void(u||s.defaultAction(a,n,i,s)))})}}),a=t["class"](function(i){t.lib.Updatable.call(this),this.update(i)},{asObject:{get:function(){return t.map(this,function(t,i,e){return"_identifier"==i&&(e.skip=!0),{key:i,value:t}},{build:{}})}},asString:{get:function(){var i="";return t.all(this,function(t,e){t&&"_identifier"!=e&&(i+="{0}:{1};".format(e,t))}),i}},clear:function(){var i=this;t.all(i,function(t,e){"_identifier"!=e&&i.remove(e)})},remove:function(t){delete this[t]},update:function(i){var e=this;if(t.is.string(i)){var s=i.split(";");t.all(s,function(t){if(""!=t){var i=t.split(/:(.+)/);e[i[0].trim()]=i[1].trim()}})}else t.is.object(i)&&t.fuse(e,i)}},t.lib.Updatable),n=t["class"](function(i){t.lib.Updatable.call(this),this.update(i)},{asObject:{get:function(){return t.map(this,function(t,i,e){return"_identifier"==i&&(e.skip=!0),{key:i,value:t}},{build:{}})}},asString:{get:function(){var i="";return t.all(this,function(t,e){t&&"_identifier"!=e&&(i+='{0}="{1}" '.format(e,t))}),i}},clear:function(){var i=this;t.all(i,function(t,e){"_identifier"!=e&&i.remove(e)})},remove:function(t){delete this[t]},update:function(i){var e=this;if(t.is.string(i)){var s=style.split(" ");t.all(s,function(t){if(""!=t){var i=t.split("=");e[i[0].trim()]=i[1].replace('"',"").trim()}})}else t.is.object(i)&&t.fuse(e,i)}},t.lib.Updatable),r=t["class"](function(i){t.lib.Updatable.call(this),this._registry={},this.update(i)},{update:function(i,e){var s=this;t.is.object(i)&&(t.fuse(s,i,{deep:Boolean(e)}),t.all(s._registry,function(e,a,n){t.is["function"](e)&&e(s,i)}))},clear:function(){var i=this;t.all(i,function(t,e){"_registry"!=e&&"_identifier"!=e&&delete i[e]})},handler:function(t,i){i?this._registry[t]=i:delete this._registry[t]}},t.lib.Updatable),u=t["class"](function(i){t.lib.Updatable.call(this),this.update(i)},{add:function(i,e){var s=i.toLowerCase();t.is.set(this[s])||(this[s]=[]),t.is.array(e)?this[s]=this[s].concat(e):this[s].push(e)},delegate:function(i,e,s){var a=i.toLowerCase(),n=this[a];if(t.is.array(n)){var e={event:a,before:!0,after:!1,isCancelled:!1,data:e};return t.all(n,function(t){setTimeout(function(){t(e)},s?s:10)}),function(){e.before=!1,e.after=!0,e.isCancelled||t.all(n,function(t){setTimeout(function(){t(e)},s?s:10)})}}},on:function(t,i){this.add(t,i)},off:function(t,i){this.remove(t,i)},remove:function(i,e){if(i){var s=i.toLowerCase();t.is.set(e)?this[s]=t.remove(this[s],e):delete this[s]}else{var a=this;t.all(a,function(t,i){delete a[i]})}},trigger:function(i,e){var s=i.toLowerCase(),a=this[s];if(t.is.array(a)){var e={event:s,before:!0,after:!1,isCancelled:!1,data:e};return t.all(a,function(t){t(e)}),function(){e.before=!1,e.after=!0,e.isCancelled||t.all(a,function(t){t(e)})}}return function(){}},update:function(i){var e=this;t.is.object(i)&&t.all(i,function(t,i){e.add(i,t)})}},t.lib.Updatable),l=t["class"](function(i){t.lib.Updatable.call(this),this._active=null,this.views=[],this.onViewChange=function(t){},this.update(i);var e=this.defaultView;e&&(this.activeView=e)},{activeView:{get:function(){return this._active},set:function(i){i&&(t.all(this.views,function(t){t.active=t.name==i.name}),this._active=i,this.onViewChange(i))}},defaultView:{get:function(){return t.search(this.views,function(t){return t["default"]})}},getView:function(i){return t.search(this.views,function(t){return t.name==i})},setView:function(t){this.activeView=this.getView(t)},update:function(i){t.is.object(i)&&t.fuse(this,i)}},t.lib.Updatable),o=t["class"](function(t){this.defaults=t},{all:function(i){var e=this;return t.map(i,function(t){return e.create(t)})},create:function(i){var e=t.fuse(this.cloneDefaults(),i);return t.all(e,function(i,s){t.is["function"](i)&&(e[s]=i.bind(e))}),e},cloneDefaults:function(){return t.fuse({},this.defaults,{deep:!0})}}),c=t["class"](function(i){var e=this;e.array=[],e.config=t.options({array:[],multiselect:!1,selection:null,map:void 0,filter:void 0,sort:void 0,debounce:50},i),e.filters={limit:function(t){var i=t;return function(t,e,s){return void 0==s.count&&(s.count=0),s.count++,s.count==i&&(s.skip=s.stop=!0),t}},selected:function(){return function(t,i,e){return t.selected||(e.skip=!0),t}},hidden:function(){return function(t,i,e){return t.hidden&&(e.skip=!0),t}}};var s=function(){var i=e.config.array;t.is.set(e.config.sort)&&(i=t.sort(i,e.config.sort)),t.is.set(e.config.filter)&&(i=t.filter(i,e.config.filter)),t.is.set(e.config.map)&&(i=t.map(i,e.config.map)),e.array=i};e.refresh=0==e.config.debounce?s:t.debounce(s,e.config.debounce),e.refresh()},{add:function(i){t.is.array(i)?this.config.array=this.config.array.slice().concat(i):this.config.array.push(i),this.refresh()},addAt:function(i,e){t.is.array(i)?Array.prototype.splice.apply(this.config.array,[e,0].concat(i)):this.config.array.splice(e,0,i),this.refresh()},clear:function(){this.array=[],this.config.array=[]},contains:function(i){return!!t.is["function"](i)&&t.contains(this.array.slice(),i)},count:{get:function(){return this.array.length}},filter:function(i){t.is["function"](i)?this.config.filter=i:this.config.filter=void 0,this.refresh()},indexOf:function(t){return this.array.indexOf(t)},map:function(i){t.is["function"](i)?this.config.map=i:this.config.map=void 0,this.refresh()},remove:function(t){var i=this.indexOf(t);i>-1&&this.removeAt(i)},removeAt:function(t){this.config.array=this.config.array.slice().splice(t,1),this.refresh()},search:function(i){return t.search(this.array.slice(),i)},sort:function(i){t.is.set(i)?this.config.sort=i:this.config.sort=void 0,this.refresh()},select:function(i){this.multiselect||t.all(this.array.slice(),function(t){return t.selected=!1}),t.is.array(i)?t.all(i,function(t){return t.selected=!0}):t.is.object(i)&&(i.selected=!0),this.config.selection=t[this.multiselect?"filter":"search"](this.array.slice(),function(t){return t.selected})},unselect:function(i){this.multiselect||t.all(this.array.slice(),function(t){return t.selected=!1}),t.is.array(i)?t.all(i,function(t){return t.selected=!1}):t.is.object(i)&&(i.selected=!1),this.config.selection=t[this.multiselect?"filter":"search"](this.array.slice(),function(t){return t.selected})},update:function(i){t.is.array(i)?this.config.array=i:t.is.object(i)&&t.fuse(this.config,i),this.refresh()}},t.lib.Updatable),h=t["class"](function(i){var e=this;e.lastStarted=0,e.lapsedTime=0,e.clock=null,e.settings=t.options({onTick:function(t){},tickRate:500},i),e.update=function(){e.settings.onTick(e.getTime())},e.start=function(){e.clock=setInterval(e.update,e.settings.tickRate),e.lastStarted=e.lastStarted?e.lastStarted:e.now()},e.stop=function(){e.lapsedTime=e.lastStarted?e.lapsedTime+e.now()-e.lastStarted:e.lapsedTime,e.lastStarted=0,clearInterval(e.clock)},e.reset=function(){e.stop(),e.lapsedTime=e.lastStarted=0,e.update()},e.getRawTime=function(){return e.lapsedTime+(e.lastStarted?e.now()-e.lastStarted:0)},e.getTime=function(){var t=0,i=0,s=0,a=0,n=e.getRawTime();return t=Math.floor(n/36e5),n%=36e5,i=Math.floor(n/6e4),n%=6e4,s=Math.floor(n/1e3),a=n%1e3,{Hours:e.pad(t,2),Minutes:e.pad(i,2),Seconds:e.pad(s,2),MilliSeconds:e.pad(a,3),Raw:n}},e.pad=function(t,i){var e="0000"+t;return e.substr(e.length-i)},e.now=function(){return(new Date).getTime()}}),f=new i,d=t["class"](function(){f.bind(this),f.context(this,function(t){t.length=0}),Array.call(this);var i=this,e=arguments;t.is.array(arguments[0])&&(e=arguments[0]),t.all(e,function(t){i.push(t)})},{length:{get:function(){return f.get(this,"length")},set:function(t){f.set(this,"length",t)}}},Array),v=t["class"](function(){},{count:{get:function(){return this.getKeys.length}},getKeys:{get:function(){return Object.keys?Object.keys(this):t.map(this,function(t,i){return i})}},getValues:{get:function(){return Object.values?Object.values(this):t.map(this,function(t,i){return t})}},each:function(i){t.all(this,i)},toArray:function(){var i=[];return t.all(this,function(t,e){i[e]=t}),i},toList:function(){return new List(this.toArray())},toDictionary:function(){var t=new p;return this.each(function(i,e){t.add(e,i)}),t}}),p=t["class"](function(){v.call(this)},{add:function(t,i){this[t]=i},clear:function(){var i=this;t.all(i,function(t,e){return i.remove(e)})},containsKey:function(i){return t.is.contains(this.getKeys,function(t){return t==i})},containsValue:function(i){return t.contains(this,function(t){return t==i})},remove:function(t){delete this[t]}},v);t.fuse(t.lib,{ConditionChain:e,StringParser:s,StyleParser:a,AttrParser:n,PrivateStore:i,Config:r,Model:o,EventManager:u,ViewManager:l,ArrayManager:c,StopWatch:h,ArrayExt:d,Enumerable:v,Dictionary:p}),"undefined"!=typeof module?module.exports=t:"undefined"!=typeof window&&(window.__=window.iterate=t)}();