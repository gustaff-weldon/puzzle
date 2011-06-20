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
    if (util.isTouch) {
        console.log.call(console, args.join(" "));
    } else {
        console.log.apply(console, args);
    }
};

util.mixin = function(target, source) {
    if (typeof source == "object") {
        for (var key in source) {
            source.hasOwnProperty(key) && (target[key] = source[key]);
        }
    }
    return target;
};

util.isTouch = ("ontouchstart" in document.documentElement);

namespace("util.dom");

util.dom.offset = function(domEl) {
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

util.dom.hasClass = function(domEl, className) {
    return (" " + domEl.className + " ").indexOf(" " + className + " ") > -1;
}

util.dom.addClass = function(domEl, className) {
    if (!util.dom.hasClass(domEl, className)) {
        domEl.className = (domEl.className + " " + className).trim();
    }
}

util.dom.removeClass = function(domEl, className) {
    if (util.dom.hasClass(domEl, className)) {
        domEl.className = (" " + domEl.className + " ").replace(" " + className + " ", " ").trim();
    }
}

// ECMAScript 5 compatibility
if (!Function.prototype.bind) {
    Function.prototype.bind = function(context) {
        var self = this,
            slice = Array.prototype.slice,
            args = slice.call(arguments, 1);
        return function() {
            self.apply(context, args.concat(slice.call(arguments)));
        }
    }
}

