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
}
