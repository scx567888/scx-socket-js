import {ScxSocketBase} from "./ScxSocketBase.js";
import {DuplicateFrameChecker} from "./DuplicateFrameChecker.js";

class EventManager extends ScxSocketBase {

    duplicateFrameChecker;
    #eventHandlerMap;
    #responseCallbackMap;
    #onMessage;
    #onClose;
    #onError;

    constructor(options) {
        super(options);
        this.duplicateFrameChecker = new DuplicateFrameChecker(options.getSeqIDClearTimeout());
        this.#eventHandlerMap = new Map();
        this.#responseCallbackMap = new Map();
    }

    onMessage(onMessage) {
        this.#onMessage = onMessage;
    }

    onClose(onClose) {
        this.#onClose = onClose;
    }

    onError(onError) {
        this.#onError = onError;
    }

    onEvent(eventName, onEvent) {
        this.#eventHandlerMap.set(eventName, onEvent);
    }

    removeEvent(eventName) {
        this.#eventHandlerMap.delete(eventName);
    }

    callOnMessage(message) {
        if (this.#onMessage != null) {
            this.#onMessage(message);
        }
    }

    callOnClose(v) {
        if (this.#onClose != null) {
            this.#onClose(v);
        }
    }

    callOnError(e) {
        if (this.#onError != null) {
            this.#onError(e);
        }
    }

    callOnMessageAsync(message) {
        if (this.#onMessage != null) {
            setTimeout(() => this.#onMessage(message));
        }
    }

    callOnCloseAsync(v) {
        if (this.#onClose != null) {
            setTimeout(() => this.#onClose(v));
        }
    }

    callOnErrorAsync(e) {
        if (this.#onError != null) {
            setTimeout(() => this.#onError(e));
        }
    }

    callOnMessageWithCheckDuplicateAsync(socketFrame) {
        if (this.#onMessage != null && this.duplicateFrameChecker.checkDuplicate(socketFrame)) {
            setTimeout(() => this.#onMessage(socketFrame.payload));
        }
    }

    callOnEventWithCheckDuplicateAsync(socketFrame) {
        let eventHandler = this.#eventHandlerMap.get(socketFrame.event_name);
        if (eventHandler != null && this.duplicateFrameChecker.checkDuplicate(socketFrame)) {
            setTimeout(() => {
                let responseData = eventHandler(socketFrame.payload);
                if (socketFrame.need_response) {
                    this.sendResponse(socketFrame.seq_id, responseData);
                }
            });
        }
    }


    setResponseCallback(socketFrame, responseCallback) {
        this.#responseCallbackMap.set(socketFrame.seq_id, responseCallback);
    }

    callResponseCallback(socketFrame) {
        let responseCallback = this.#responseCallbackMap.get(socketFrame.ack_id);
        this.#responseCallbackMap.delete(socketFrame.ack_id);
        if (responseCallback != null) {
            responseCallback(socketFrame.payload);
        }
    }

    callResponseCallbackAsync(socketFrame) {
        let responseCallback = this.#responseCallbackMap.get(socketFrame.ack_id);
        this.#responseCallbackMap.delete(socketFrame.ack_id);
        if (responseCallback != null) {
            setTimeout(() => responseCallback(socketFrame.payload));
        }
    }

}

export {EventManager};
