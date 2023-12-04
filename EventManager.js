import {ScxSocketBase} from "./ScxSocketBase.js";
import {DuplicateFrameChecker} from "./DuplicateFrameChecker.js";

//同步完成 23/12/01
class EventManager extends ScxSocketBase {

    duplicateFrameChecker;
    eventHandlerMap;
    responseCallbackMap;
    onMessage;
    onClose;
    onError;

    constructor(options) {
        super(options);
        this.duplicateFrameChecker = new DuplicateFrameChecker(options.getSeqIDClearTimeout());
        this.eventHandlerMap = new Map();
        this.responseCallbackMap = new Map();
    }

    onMessage0(onMessage) {
        this.onMessage = onMessage;
        return this;
    }

    onClose0(onClose) {
        this.onClose = onClose;
        return this;
    }

    onError0(onError) {
        this.onError = onError;
        return this;
    }

    onEvent(eventName, onEvent) {
        this.eventHandlerMap.put(eventName, new EventHandler(onEvent));
        return this;
    }

    onEvent(eventName, onEvent) {
        this.eventHandlerMap.put(eventName, new EventHandler(onEvent));
        return this;
    }

    onEvent(eventName, onEvent) {
        this.eventHandlerMap.put(eventName, new EventHandler(onEvent));
        return this;
    }

    removeEvent(eventName) {
        this.eventHandlerMap.remove(eventName);
        return this;
    }

    callOnMessage(message) {
        if (this.onMessage != null) {
            this.onMessage(message);
        }
    }

    callOnClose(v) {
        if (this.onClose != null) {
            this.onClose(v);
        }
    }

    callOnError(e) {
        if (this.onError != null) {
            this.onError(e);
        }
    }

    callOnMessageAsync(message) {
        if (this.onMessage != null) {
            setTimeout(() => this.onMessage(message));
        }
    }

    callOnCloseAsync(v) {
        if (this.onClose != null) {
            setTimeout(() => this.onClose(v));
        }
    }

    callOnErrorAsync(e) {
        if (this.onError != null) {
            setTimeout(() => this.onError(e));
        }
    }

    callOnMessageWithCheckDuplicateAsync(socketFrame) {
        if (this.onMessage != null && this.duplicateFrameChecker.checkDuplicate(socketFrame)) {
            setTimeout(() => this.onMessage(socketFrame.payload));
        }
    }

    callOnEventWithCheckDuplicateAsync(socketFrame) {
        let eventHandler = this.eventHandlerMap.get(socketFrame.event_name);
        if (eventHandler != null && this.duplicateFrameChecker.checkDuplicate(socketFrame)) {
            setTimeout(() => {
                if (eventHandler.type === 0) {
                    let event0 = eventHandler.event0();
                    event0.accept(socketFrame.payload);
                    if (socketFrame.need_response) {
                        this.sendResponse(socketFrame.seq_id, null);
                    }
                } else if (eventHandler.type === 1) {
                    let event1 = eventHandler.event1();
                    let responseData = event1.apply(socketFrame.payload);
                    if (socketFrame.need_response) {
                        this.sendResponse(socketFrame.seq_id, responseData);
                    }
                } else if (eventHandler.type === 2) {
                    let event2 = eventHandler.event2();
                    if (socketFrame.need_response) {
                        let scxSocketRequest = new ScxSocketRequest(this, socketFrame.seq_id);
                        event2.accept(socketFrame.payload, scxSocketRequest);
                    } else {
                        event2.accept(socketFrame.payload, null);
                    }
                }
            });
        }
    }


    setResponseCallback(socketFrame, responseCallback) {
        this.responseCallbackMap.set(socketFrame.seq_id, responseCallback);
    }

    callResponseCallback(socketFrame) {
        let responseCallback = this.responseCallbackMap.delete(socketFrame.ack_id);
        if (responseCallback != null) {
            responseCallback.accept(socketFrame.payload);
        }
    }

    callResponseCallbackAsync(socketFrame) {
        let responseCallback = this.responseCallbackMap.remove(socketFrame.ack_id);
        if (responseCallback != null) {
            setTimeout(() => responseCallback.accept(socketFrame.payload));
        }
    }

}

export {EventManager};
