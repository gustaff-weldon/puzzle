(function(){
    var obj = new Object();
    util.mixin(obj, PZ.event.observable);
    var eventsCalled = { count: 0},
        testFunc = function(eventData) { 
            eventsCalled["count"]++;
            eventsCalled['data'] = eventData;
        },
        sampleData = {someData : "ttttt"}
    
    assertTrue(typeof obj.addEventListener != "undefined", "addEventListener should be defined in obj");    
    obj.addEventListener('testEvent', testFunc);
    obj.fireEvent('testEvent', sampleData);
    assertTrue(eventsCalled.count === 1, "fireEvent should have invoked listener");
    assertTrue(eventsCalled.data === sampleData, "event data should be indentical");

    obj.fireEvent('testEvent', sampleData);
    assertTrue(eventsCalled.count === 2, "fireEvent should have invoked listener");

    obj.removeEventListener('testEvent', testFunc);
    obj.fireEvent('testEvent');
    assertTrue(eventsCalled.count === 2, "listener should have been invoked should have invoked listener");
    
    //TODO add more testcases for multiple listeners
}());
