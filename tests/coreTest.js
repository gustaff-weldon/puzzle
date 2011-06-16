(function(){

    function assertTrue (condition, msg) {
        !condition && console.error(msg);
    }

    // TESTS
    
    // check if util namespace is defined
    assertTrue(typeof util !== 'undefined', "`util` namespace should be defined");
    
    // Testing mixin
    assertTrue(typeof util.mixin == 'function', "`util.mixin` should be a function");

    var target = { a: "A", b: "B", c: function(){ return "C" } },
        source = { b: "b", d: function(){ return "d" }},
        result = util.mixin(target, source);
    
    assertTrue(target.b == source.b && target.d == source.d, "`util.mixin` should copy all properties from source to target object");
    assertTrue(target.a == "A" && target.c() == "C", "`util.mixin` should not alter any other properties in target object");
    assertTrue(result == target, "`util.mixin` should return modified target object");

})();

