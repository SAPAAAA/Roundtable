import {EventEmitter} from 'events';

class EventBus extends EventEmitter {
    emitEvent(event, payload) {
        this.emit(event, payload);
    }

    subscribe(event, listener) {
        this.on(event, listener);
    }

    unsubscribe(event, listener) {
        this.off(event, listener);
    }
}

const eventBus = new EventBus();
eventBus.setMaxListeners(50); // Prevent memory leak warning

export default eventBus;
