(function(){
    // TESTS
    
    // check if util namespace is defined
    console.assert(typeof util !== 'undefined', "`util` namespace should be defined");
    
    // Testing mixin
    console.assert(typeof util.mixin == 'function', "`util.mixin` should be a function");

    var target = { a: "A", b: "B", c: function(){ return "C" } },
        source = { b: "b", d: function(){ return "d" }},
        result = util.mixin(target, source);
    
    console.assert(target.b == source.b && target.d == source.d, "`util.mixin` should copy all properties from source to target object");
    console.assert(target.a == "A" && target.c() == "C", "`util.mixin` should not alter any other properties in target object");
    console.assert(result == target, "`util.mixin` should return modified target object");

    // Testing util.dom.hasClass
    
    var div = document.createElement("div");
    console.assert(typeof util.dom.hasClass == 'function', "`util.dom.hasClass` should be a function");
    
    console.assert(util.dom.hasClass(div, "anything") == false, "`util.dom.hasClass` should be false when className is empty");
    
    div.className = "test"
    console.assert(util.dom.hasClass(div, "test") == true, "`util.dom.hasClass` should be true when className is exact match");
    console.assert(util.dom.hasClass(div, "tes") == false, "`util.dom.hasClass` should be false when className is matched paritally");
    
    div.className = "test another-class"
    console.assert(util.dom.hasClass(div, "test") == true, "`util.dom.hasClass` should be true when className contains requested class");
})();

