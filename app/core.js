namespace =  function() {
    var a = arguments, obj = null, i, j, chunks;
    for (i = 0; i < a.length; i = i + 1) {
        chunks = a[i].split(".");
        obj = window;
        for (j = 0; j < chunks.length; j = j + 1) {
            obj[chunks[j]] = obj[chunks[j]] || {};
            obj = obj[chunks[j]];
        }
    }
    return obj;
};

namespace("util");

util.log = function() {
    var args = Array.prototype.slice.call(arguments, 0); 
    args.unshift(new Date().getTime()); 
    console.log.apply(console, args);
};

util.mixin = function(target, source) {
    if (typeof source == "object") {
        for (var key in source) {
            source.hasOwnProperty(key) && (target[key] = source[key]);
        }
    }
    return target;
};

//polyfill Function.prototype instead?
util.bind = function(func, context) {
    return function() {
        func.apply(context, arguments);
    }
}

util.isTouch = function() {
    return ("ontouchstart" in document.documentElement);
}


util.offset = function(domEl) {
    var ox = 0, oy = 0;
    if (domEl.offsetParent) {
        do {        
            ox+= domEl.offsetLeft;
            oy+= domEl.offsetTop;
        }
        while (domEl = domEl.offsetParent);
    }
    
    return {x: ox, y: oy};
}
