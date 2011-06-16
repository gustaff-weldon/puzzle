var obs = new PZ.event.Observable();

var testFunc = function(eventData) { console.log('test listener', eventData)}
obs.addEventListener('testEvent', testFunc);
obs.fireEvent('testEvent', {someData : "ttttt"});
obs.removeEventListener('testEvent', testFunc);
obs.fireEvent('testEvent');