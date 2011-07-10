(function(){
    // TESTS
    var tests = {
        testNamespace : function() {
            // check if util namespace is defined
            console.assert(typeof util !== 'undefined', "`util` namespace should be defined");
        },
        
        testMixin : function() {
            // Testing mixin
            console.assert(typeof util.mixin == 'function', "`util.mixin` should be a function");
            var target = { a: "A", b: "B", c: function(){ return "C" } },
                source = { b: "b", d: function(){ return "d" }},
                result = util.mixin(target, source);
            
            console.assert(target.b == source.b && target.d == source.d, "`util.mixin` should copy all properties from source to target object");
            console.assert(target.a == "A" && target.c() == "C", "`util.mixin` should not alter any other properties in target object");
            console.assert(result == target, "`util.mixin` should return modified target object");
        },
        
        testDom : function() {
            // Testing util.dom.hasClass
            var div = document.createElement("div");
            console.assert(typeof util.dom.hasClass == 'function', "`util.dom.hasClass` should be a function");
            
            console.assert(util.dom.hasClass(div, "anything") == false, "`util.dom.hasClass` should be false when className is empty");
            
            div.className = "test"
            console.assert(util.dom.hasClass(div, "test") == true, "`util.dom.hasClass` should be true when className is exact match");
            console.assert(util.dom.hasClass(div, "tes") == false, "`util.dom.hasClass` should be false when className is matched paritally");
            
            div.className = "test another-class"
            console.assert(util.dom.hasClass(div, "test") == true, "`util.dom.hasClass` should be true when className contains requested class");
        },

        testBind : function() {
            function test(param) {
                this.pass = true;
                this.param = param;
                return 'hello ' + param;
            }

            var obj = {}, res = null;
            var test1 = test.bind(obj);
            res = test1();
            console.assert(obj.pass === true, "bound function should be called in context of obj1");
            console.assert(typeof obj.param === "undefined", "bound function should be called without a parameter");
            console.assert(res === "hello undefined", "bound function should have a return value with undefined");

            var obj2 = {}, res2 = null;
            var test2 = test.bind(obj2);
            res2 = test2("world");
            console.assert(obj2.pass === true, "bound function should be called in context of obj2");
            console.assert(obj2.param === "world", "bound function should be called with a parameter");
            console.assert(res2 === "hello world", "bound function should have a return value with hello");
        },
        
        testRandom : function() {
            var i =0, res = null;
            for(i = 0; i < 1000; i++) {
                res = util.randomInt(0,10);
                console.assert(typeof res == "number", "random should return number");
                console.assert(res >=0 && res <= 10, "random should return number between 0 and 10");
                console.assert(res - Math.floor(res) === 0, "random should return integers");
            }
            
            var res = util.randomInt(0,0);
            console.assert(res === 0, "random 0,0 should return 0");
            for (i = 0; i < 100; i++) {
                res = util.randomInt(0, 1);
                console.assert(res === 0 || res === 1, "random 0,1 should either 0 or 1");
            }
        }
    };
    
    //test framework ;) utility method
    tests.run = function() {
        var testcases = 0;
        for (key in this) {
            if (key.indexOf("test") === 0 && this.hasOwnProperty(key) && typeof this[key] == "function") {
                this[key]() 
                testcases++;
            }
        }
        console.log("Finished " + testcases + " testcase(s)");
    }

    tests.run();
})();

