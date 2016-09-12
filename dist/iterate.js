"use strict";!function(){var t=require("iterate-js-lite");t.download=function(e,i,s){var n={csv:{ext:".csv",encoding:"data:application/csv;charset=utf-8",parse:function(e){return t.is.array(e)?e.join(""):e}},json:{ext:".json",encoding:"data:application/json;charset=utf-8",parse:function(e){return t.is.string(e)?e:JSON.stringify(e)}}},a=n[s.toLowerCase()],r=a.parse(e);if(window.navigator.userAgent.indexOf("MSIE ")>-1||navigator.userAgent.match(/Trident.*rv\:11\./)){var u=window.open("","_blank");u.document.open("text/csv","replace"),u.document.write(r),u.document.close(),u.document.execCommand("SaveAs",!0,i+a.ext),u.close()}else{var l=a.encoding+","+encodeURIComponent(r),o=document.createElement("a");o.href=l,o.style="visibility:hidden",o.download=i+a.ext,document.body.appendChild(o),o.click(),document.body.removeChild(o)}},t.flow=function(t){return new i({initialValue:t,value:t})},t.render={blend:function(t,e,i){var s=parseInt(t.slice(1),16),n=parseInt(e.slice(1),16),a=s>>16,r=s>>8&255,u=255&s,l=n>>16,o=n>>8&255,c=255&n;return"#"+(16777216+65536*(Math.round((l-a)*i)+a)+256*(Math.round((o-r)*i)+r)+(Math.round((c-u)*i)+u)).toString(16).slice(1)},bytesToImageSrc:function(t,e){return"data:image/{0};base64,{1}".format(e?e:"png",t)},bytesToCanvas:function(t,e,i,s){for(var n=i.getContext("2d"),a=t,r=a.length,u=[r];r--;)u[r]=String.fromCharCode(a[r]);var l=u.join(""),o=window.btoa(l),c=new Image;c.src="data:image/{0};base64,{1}".format(e?e:"png",o),c.onload=function(){console.log("Image Onload"),n.drawImage(c,s[0],s[1],i.width,i.height)},c.onerror=function(t){console.log("Img Onerror:",t)}}};var e=t["class"](function(){this.map=new WeakMap},{context:function(t,e){return e(this.map.get(t))},bind:function(e,i){this.map.set(e,t.is.object(i)?i:{})},get:function(e,i){return t.prop(this.map.get(e),i)},set:function(e,i,s){var n=i.split(".");if(n.length>0){var a=n.pop(),r=this.map.get(e);t.all(n,function(e){t.is.set(r[e])||(r[e]={}),r=r[e]}),r[a]=s}}}),i=t["class"](function(e){this.details={initialValue:e,value:e,status:!0},t.is.object(e)&&t.fuse(this.details,e)},{result:{get:function(){return this.details.status}},all:function(e){var i=t.getType(this.details.value);return i!=t.types.array&&i!=t.types.object&&i!=t.types.args&&i!=t.types.string||t.all(this.details.value,e),this},append:function(e){var i=t.getType(this.details.value);return i==t.types.array?this.details.value.push(e):i==t.types.string&&t.is.string(e)&&(this.details.value+=e),this},appendTo:function(e){var i=t.getType(this.details.value);return i==t.types.array?this.details.value.unshift(e):i==t.types.string&&t.is.string(e)&&(this.details.value=e+this.details.value),this},average:function(e){return t.is.array(this.details.value)&&(this.details.value=t.math.average(this.details.value,e)),this},call:function(e,i){var s=t.getType(this.details.value);return s!=t.types.array&&s!=t.types.object&&s!=t.types.args&&s!=t.types.string||t.call(this.details.value,e,i),this},contains:function(e){if(this.details.status){var i=t.getType(this.details.value);i!=t.types.array&&i!=t.types.object&&i!=t.types.args&&i!=t.types.string||(this.details.status=t.contains(this.details.value,e))}return this},count:function(e){var i=t.getType(this.details.value);return i!=t.types.array&&i!=t.types.object&&i!=t.types.args&&i!=t.types.string||(this.details.value=t.count(this.details.value)),this},equals:function(t){return this.details.status&&(this.details.status=this.details.value==t),this},equalsExplicit:function(t){return this.details.status&&(this.details.status=this.details.value===t),this},evaluate:function(e){return this.details.status&&t.is["function"](e)&&e(this.details),this},filter:function(e){var i=t.getType(this.details.value);return i!=t.types.array&&i!=t.types.object||(this.details.value=t.filter(this.details.value,e)),this},first:function(e,i){var s=t.getType(this.details.value);return s!=t.types.array&&s!=t.types.object||(this.details.value=t.first(this.details.value,e,i)),this},getProperty:function(e){return this.details.value=t.prop(this.details.value,e),this},group:function(e){var i=t.getType(this.details.value);return i!=t.types.array&&i!=t.types.object||(this.details.value=t.group(this.details.value,e)),this},then:function(t){return this.details.status&&t(this.details),this},"else":function(t){return this.details.status||t(this.details),this},isDefined:function(){return this.details.status&&(this.details.status=t.i.defaultConditions(this.details.value)),this},isSameType:function(e){return this.details.status=t.is.sameType(this.details.value,e),this},isSet:function(){return this.details.status&&(this.details.status=t.i.setConditions(this.details.value)),this},isType:function(e){return this.details.status=t.getType(this.details.value)==e,this},isArgs:function(){return this.details.status=t.is.args(this.details.value),this},isArray:function(){return this.details.status=t.is.array(this.details.value),this},isBoolean:function(){return this.details.status=t.is.bool(this.details.value),this},isDate:function(){return this.details.status=t.is.date(this.details.value),this},isFunction:function(){return this.details.status=t.is["function"](this.details.value),this},isNull:function(){return this.details.status=t.is["null"](this.details.value),this},isNaN:function(){return this.details.status=t.is.nan(this.details.value),this},isNumber:function(){return this.details.status=t.is.number(this.details.value),this},isObject:function(){return this.details.status=t.is.object(this.details.value),this},isString:function(){return this.details.status=t.is.string(this.details.value),this},isUndefined:function(){return this.details.status=t.is.undefined(this.details.value),this},last:function(e,i){var s=t.getType(this.details.value);return s!=t.types.array&&s!=t.types.object||(this.details.value=t.last(this.details.value,e,i)),this},map:function(e,i){var s=t.getType(this.details.value);return s!=t.types.array&&s!=t.types.object||(this.details.value=t.map(this.details.value,e,i)),this},max:function(e){return t.is.array(this.details.value)&&(this.details.value=t.math.max(this.details.value,e)),this},median:function(e){return t.is.array(this.details.value)&&(this.details.value=t.math.max(this.details.value,e)),this},min:function(e){return t.is.array(this.details.value)&&(this.details.value=t.math.min(this.details.value,e)),this},search:function(e,i){var s=t.getType(this.details.value);return s!=t.types.array&&s!=t.types.object&&s!=t.types.args&&s!=t.types.string||(this.details.value=t.search(this.details.value,e,i)),this},sort:function(e){var i=t.getType(this.details.value);return i!=t.types.array&&i!=t.types.object||(this.details.value=t.sort(this.details.value,e)),this},sum:function(e){return t.is.array(this.details.value)&&(this.details.value=t.math.sum(this.details.value,e)),this},value:function(t){return this.details.status||void 0==t?this.details.value:t},update:function(e){return this.details.status?this.details.value=t.fuse(e,this.details.value):this.details.value=e,this}}),s=t["class"](function(e,i){var s={},n={};t.all(e,function(t,e){e.length>1?n[e]=t:s[e]=t}),this.keyChars=s,this.keyWords=n,this.options=i?i:{}},{parse:function(e){var i=this,s=t.flow(i.options).isSet().update({skip:0,bubble:!0,ignoreCase:!0,defaultAction:function(){}}).value(),n="",a=0,r=function(){},u=!1;t.all(e,function(l,o){return s.skip>0?s.skip--:(s.bubble=!0,u=!1,n=l,a=parseInt(o),r=i.keyChars[n],t.is["function"](r)&&(r(n,a,e,s),u=!0),t.all(i.keyWords,function(i,l){if((s.bubble||!u)&&(l[0]&&s.ignoreCase?l[0].toLowerCase():l[0])==(n&&s.ignoreCase?n.toLowerCase():n)){var o=!0,c="";t.all(l,function(t,i){c=e[a+parseInt(i)],(t&&s.ignoreCase?t.toLowerCase():t)!=(c&&s.ignoreCase?c.toLowerCase():c)&&(o=!1)}),o&&(r=i,void 0!=r&&(s.skip=l.length-1,r(l,a,e,s),u=!0))}}),void(u||s.defaultAction(n,a,e,s)))})}}),n=t["class"](function(e){t.lib.Updatable.call(this),this.update(e)},{asObject:{get:function(){return t.map(this,function(t,e,i){return"_identifier"==e&&(i.skip=!0),{key:e,value:t}},{build:{}})}},asString:{get:function(){var e="";return t.all(this,function(t,i){t&&"_identifier"!=i&&(e+="{0}:{1};".format(i,t))}),e}},clear:function(){var e=this;t.all(e,function(t,i){"_identifier"!=i&&e.remove(i)})},remove:function(t){delete this[t]},update:function(e){var i=this;if(t.is.string(e)){var s=e.split(";");t.all(s,function(t){if(""!=t){var e=t.split(/:(.+)/);i[e[0].trim()]=e[1].trim()}})}else t.is.object(e)&&t.fuse(i,e)}},t.lib.Updatable),a=t["class"](function(e){t.lib.Updatable.call(this),this.update(e)},{asObject:{get:function(){return t.map(this,function(t,e,i){return"_identifier"==e&&(i.skip=!0),{key:e,value:t}},{build:{}})}},asString:{get:function(){var e="";return t.all(this,function(t,i){t&&"_identifier"!=i&&(e+='{0}="{1}" '.format(i,t))}),e}},clear:function(){var e=this;t.all(e,function(t,i){"_identifier"!=i&&e.remove(i)})},remove:function(t){delete this[t]},update:function(e){var i=this;if(t.is.string(e)){var s=style.split(" ");t.all(s,function(t){if(""!=t){var e=t.split("=");i[e[0].trim()]=e[1].replace('"',"").trim()}})}else t.is.object(e)&&t.fuse(i,e)}},t.lib.Updatable),r=t["class"](function(e){t.lib.Updatable.call(this),this._registry={},this.update(e)},{update:function(e,i){var s=this;t.is.object(e)&&e&&(i?t.fuse(s,e,!0):t.fuse(s,e),t.all(s._registry,function(i,n,a){t.is["function"](i)&&i(s,e)}))},clear:function(){var e=this;t.all(e,function(t,i){"_registry"!=i&&"_identifier"!=i&&delete e[i]})},handler:function(t,e){e?this._registry[t]=e:delete this._registry[t]}},t.lib.Updatable),u=t["class"](function(e){t.lib.Updatable.call(this),this.update(e)},{add:function(e,i){var s=e.toLowerCase();t.is.set(this[s])||(this[s]=[]),t.is.array(i)?this[s]=this[s].concat(i):this[s].push(i)},delegate:function(e,i,s){var n=e.toLowerCase(),a=this[n];if(t.is.array(a)){var i={event:n,before:!0,after:!1,isCancelled:!1,data:i};return t.all(a,function(t){setTimeout(function(){t(i)},s?s:10)}),function(){i.before=!1,i.after=!0,i.isCancelled||t.all(a,function(t){setTimeout(function(){t(i)},s?s:10)})}}},remove:function(e,i){var s=e.toLowerCase();t.is.set(i)?this[s]=t.remove(this[s],i):delete this[s]},trigger:function(e,i){var s=e.toLowerCase(),n=this[s];if(t.is.array(n)){var i={event:s,before:!0,after:!1,isCancelled:!1,data:i};return t.all(n,function(t){t(i)}),function(){i.before=!1,i.after=!0,i.isCancelled||t.all(n,function(t){t(i)})}}},update:function(e){var i=this;t.is.object(e)&&t.all(e,function(t,e){i.add(e,t)})}},t.lib.Updatable),l=t["class"](function(e){t.lib.Updatable.call(this),this._active=null,this.views=[],this.onViewChange=function(t){},this.update(e);var i=this.defaultView;i&&(this.activeView=i)},{activeView:{get:function(){return this._active},set:function(e){e&&(t.all(this.views,function(t){t.active=t.name==e.name}),this._active=e,this.onViewChange(e))}},defaultView:{get:function(){return t.search(this.views,function(t){return t["default"]})}},getView:function(e){return t.search(this.views,function(t){return t.name==e})},setView:function(t){this.activeView=this.getView(t)},update:function(e){t.is.object(e)&&t.fuse(this,e)}},t.lib.Updatable),o=t["class"](function(e){this.array=[],this.config={array:[],multiselect:!1,selection:null,map:void 0,filter:void 0,sort:void 0},t.is.object(e)&&t.fuse(this.config,e),this.filters={limit:function(t){var e=t;return function(t,i,s){return void 0==s.count&&(s.count=0),s.count++,s.count==e&&(s.skip=s.stop=!0),t}},selected:function(){return function(t,e,i){return t.selected||(i.skip=!0),t}},hidden:function(){return function(t,e,i){return t.hidden&&(i.skip=!0),t}}},this.refresh()},{add:function(e){t.is.array(e)?this.config.array=this.config.array.slice().concat(e):this.config.array.push(e),this.refresh()},addAt:function(e,i){t.is.array(e)?Array.prototype.splice.apply(this.config.array,[i,0].concat(e)):this.config.array.splice(i,0,e),this.refresh()},clear:function(){this.array=[],this.config.array=[]},contains:function(e){return!!t.is["function"](e)&&t.contains(this.array.slice(),e)},count:{get:function(){return this.array.length}},filter:function(e){t.is["function"](e)?this.config.filter=e:this.config.filter=void 0,this.refresh()},indexOf:function(t){return this.array.indexOf(t)},map:function(e){t.is["function"](e)?this.config.map=e:this.config.map=void 0,this.refresh()},refresh:function(){var e=this.config.array;t.is.set(this.config.sort)&&(e=t.sort(e.slice(),this.config.sort)),t.is.set(this.config.filter)&&(e=t.filter(e,this.config.filter)),t.is.set(this.config.map)&&(e=t.map(e,this.config.map)),this.array=e},remove:function(t){var e=this.indexOf(t);e>-1&&this.removeAt(e)},removeAt:function(t){this.config.array=this.config.array.slice().splice(t,1),this.refresh()},search:function(e){return t.search(this.array.slice(),e)},sort:function(e){t.is.set(e)?this.config.sort=e:this.config.sort=void 0,this.refresh()},select:function(e){this.multiselect||t.all(this.array.slice(),function(t){return t.selected=!1}),t.is.array(e)?t.all(e,function(t){return t.selected=!0}):e.selected=!0,this.config.selection=t[this.multiselect?"filter":"search"](this.array.slice(),function(t){return t.selected})},unselect:function(e){this.multiselect||t.all(this.array.slice(),function(t){return t.selected=!1}),t.is.array(e)&&t.all(e,function(t){return t.selected=!1}),this.config.selection=t[this.multiselect?"filter":"search"](this.array.slice(),function(t){return t.selected})},update:function(e){t.is.array(e)?this.config.array=e:t.is.object(e)&&t.fuse(this.config,e),this.refresh()}},t.lib.Updatable),c=t["class"](function(e){var i=this;i.lastStarted=0,i.lapsedTime=0,i.clock=null,i.settings={onTick:function(t){},tickRate:500},t.is.object(e)&&t.fuse(i.settings,e),i.update=function(){i.settings.onTick(i.getTime())},i.start=function(){i.clock=setInterval(i.update,i.settings.tickRate),i.lastStarted=i.lastStarted?i.lastStarted:i.now()},i.stop=function(){i.lapsedTime=i.lastStarted?i.lapsedTime+i.now()-i.lastStarted:i.lapsedTime,i.lastStarted=0,clearInterval(i.clock)},i.reset=function(){i.stop(),i.lapsedTime=i.lastStarted=0,i.update()},i.getRawTime=function(){return i.lapsedTime+(i.lastStarted?i.now()-i.lastStarted:0)},i.getTime=function(){var t=0,e=0,s=0,n=0,a=i.getRawTime();return t=Math.floor(a/36e5),a%=36e5,e=Math.floor(a/6e4),a%=6e4,s=Math.floor(a/1e3),n=a%1e3,{Hours:i.pad(t,2),Minutes:i.pad(e,2),Seconds:i.pad(s,2),MilliSeconds:i.pad(n,3),Raw:a}},i.pad=function(t,e){var i="0000"+t;return i.substr(i.length-e)},i.now=function(){return(new Date).getTime()}}),h=new e,f=t["class"](function(){h.bind(this),h.context(this,function(t){t.length=0}),Array.call(this);var e=this,i=arguments;t.is.array(arguments[0])&&(i=arguments[0]),t.all(i,function(t){e.push(t)})},{length:{get:function(){return h.get(this,"length")},set:function(t){h.set(this,"length",t)}}},Array),d=t["class"](function(){},{count:{get:function(){return this.getKeys.length}},getKeys:{get:function(){return Object.keys?Object.keys(this):t.map(this,function(t,e){return e})}},getValues:{get:function(){return Object.values?Object.values(this):t.map(this,function(t,e){return t})}},each:function(e){t.all(this,e)},toArray:function(){var e=[];return t.all(this,function(t,i){e[i]=t}),e},toList:function(){return new v(this.toArray())},toDictionary:function(){var t=new p;return this.each(function(e,i){t.add(i,e)}),t}}),v=t["class"](function(t){d.call(this),this.addRange(t)},{add:function(t,e){for(var i=e&&e.start,s=i?e.start:0;this.hasOwnProperty(s);)s++;return this[s]=t,i&&(e.start=s),this},addRange:function(e){if(t.is.array(e)||e instanceof d){var i=this,s={start:0};t.all(e,function(t){return i.add(t,s)})}return this},clear:function(){var e=this;return t.all(e,function(t,i){delete e[i]}),e},contains:function(e){return t.is["function"](e)?t.contains(this,e):t.contains(this,function(t){return t==e})},count:{get:function(){return this.getKeys.length},set:function(t){var e=this.count;e>t&&this.removeRange(t-1)}},distinct:function(e){var i=this.toArray();return i=t.distinct(i,e),new v(i)},indexOf:function(e){return t.search(this,function(t){return t==e},{getKey:!0})},insert:function(e,i){var s=this,n=parseInt(e),a=t.sort(t.filter(t.map(this.getKeys,function(t){return parseInt(t)}),function(t){return t>=n}),{dir:"desc"});return t.all(a,function(t){s[t+1]=s[t]}),s[n]=i,this},insertRange:function(e,i){var s=this,n=parseInt(e),a=void 0!=i.length?i.length:i.count,r=t.sort(t.filter(t.map(this.getKeys,function(t){return parseInt(t)}),function(t){return t>=n}),{dir:"desc"});return t.all(r,function(t){s[t+a]=s[t]}),t.all(i,function(t){s[n]=t,n++}),this},getRange:function(e,i){var s=this,n=t.map(s.getKeys,function(t){return parseInt(t)}),a=parseInt(e),i=i?parseInt(i):n[n.length-1];return t.map(n,function(t,e,s){return e>=a&&e<=i?t:void(s.skip=!0)})},remove:function(t){var e=this.indexOf(t);return null!=e&&this.removeAt(e),this},removeAt:function(e){var i=this,s=parseInt(e),n=t.filter(t.map(this.getKeys,function(t){return parseInt(t)}),function(t){return t>s});return delete this[s],t.all(n,function(t){return i[t-1]=i[t]}),delete this[n[n.length-1]],this},removeRange:function(e,i){var s=this,n=t.map(this.getKeys,function(t){return parseInt(t)}),a=parseInt(e),i=i?parseInt(i):n[n.length-1];return t.all(t.filter(n,function(t){return t>=a&&t<=i}),function(t){return delete s[t]}),i<n[n.length-1]&&(t.all(t.filter(n,function(t){return t>i}),function(t){return s[a++]=s[t]}),delete s[n[n.length-1]]),this},search:function(e){return t.is["function"](e)?t.search(this,e):t.search(this,function(t){return t==e})},select:function(e){var i=this.toArray();return i=t.map(i,e),new v(i)},sort:function(e){var i=this.toArray();i=t.sort(i,e);var s=this;return t.all(i,function(t,e){return s[e]=i}),this},where:function(e){var i=this.toArray();return i=t.filter(i,e),new v(i)}},d),p=t["class"](function(){d.call(this)},{add:function(t,e){this[t]=e},clear:function(){var e=this;t.all(e,function(t,i){return e.remove(i)})},containsKey:function(e){return t.is.contains(this.getKeys,function(t){return t==e})},containsValue:function(e){return t.contains(this,function(t){return t==e})},remove:function(t){delete this[t]}},d);t.fuse(t.lib,{ConditionChain:i,StringParser:s,StyleParser:n,AttrParser:a,PrivateStore:e,Config:r,EventManager:u,ViewManager:l,ArrayManager:o,StopWatch:c,ArrayExt:f,Enumerable:d,List:v,Dictionary:p}),"undefined"!=typeof module?module.exports=t:"undefined"!=typeof window&&(window.__=window.iterate=t)}();