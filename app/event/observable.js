namespace("PZ.event");

PZ.event.Observable = function() {
}

PZ.event.Observable.prototype = {
    listeners: {},
    
    addEventListener: function(eventName, listener) {
        if (typeof this.listeners[eventName] == "undefined") {
            this.listeners[eventName] = [];
        }
        //TODO check for uniqueness, to avoid double listener
        this.listeners[eventName].push(listener);
    },
    
    removeEventListener: function(eventName, listener) {
        var eventListeners = this.listeners[eventName], removed = false;
        
        if (!listener || typeof eventListeners == "undefined" 
            || eventListeners.length == 0) {
            return false;
        }
        
        var len = eventListeners.length, i;
        for (i = 0; i < len; i++) {
            if (listener === eventListeners[i]) {
                eventListeners.splice (i,1);
                removed = true;
                break;
            }
        }
        
        return removed;
    },
    
    fireEvent: function(eventName, eventData) {
        var eventListeners = this.listeners[eventName];
        if (!eventListeners || !eventListeners.length) { //empty or undefined
            return;
        }
        
        var len = eventListeners.length, i;
        for (i = 0; i < len; i++) {
            eventListeners[i].call(this, eventData);
        }        
    }
};
PZ.event.Observable.prototype.constructor = PZ.event.Observable;