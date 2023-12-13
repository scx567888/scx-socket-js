import {FrameCreator} from "./FrameCreator.js";
import {DEFAULT_SEND_OPTIONS} from "./SendOptions.js";
import {ACK, MESSAGE, RESPONSE} from "./ScxSocketFrameType.js";
import {ScxSocketFrame} from "./ScxSocketFrame.js";

//todo 方法重载待处理
class ScxSocketBase {

    options;
    frameCreator;
    webSocket;

    constructor(options) {
        this.options = options;
        this.frameCreator = new FrameCreator();
    }

    send0(content) {
        this.send(this.frameCreator.createMessageFrame(content, DEFAULT_SEND_OPTIONS), DEFAULT_SEND_OPTIONS);
    }

    send1(content, options) {
        this.send(this.frameCreator.createMessageFrame(content, options), options);
    }

    sendEvent0(eventName, data) {
        this.send(this.frameCreator.createEventFrame(eventName, data, DEFAULT_SEND_OPTIONS), DEFAULT_SEND_OPTIONS);
    }

    sendEvent1(eventName, data, options) {
        this.send(this.frameCreator.createEventFrame(eventName, data, options), options);
    }

    sendEvent2(eventName, data, responseCallback) {
        let eventFrame = this.frameCreator.createRequestFrame(eventName, data, DEFAULT_SEND_OPTIONS);
        this.setResponseCallback(eventFrame, responseCallback);
        this.send(eventFrame, DEFAULT_SEND_OPTIONS);
    }

    sendEvent3(eventName, data, responseCallback, options) {
        let eventFrame = this.frameCreator.createRequestFrame(eventName, data, options);
        this.setResponseCallback(eventFrame, responseCallback);
        this.send(eventFrame, options);
    }

    sendResponse(ack_id, responseData) {
        this.send(this.frameCreator.createResponseFrame(ack_id, responseData, DEFAULT_SEND_OPTIONS), DEFAULT_SEND_OPTIONS);
    }

    sendAck(ack_id) {
        let ackFrame = FrameCreator.createAckFrame(ack_id);
        this.webSocket.send(ackFrame.toJson());
    }

    bind(webSocket) {
        this.webSocket = webSocket;
        this.webSocket.onmessage = (t) => this.doSocketFrame(ScxSocketFrame.fromJson(t.data));
        this.webSocket.onclose = (v) => this.doClose(v);
        this.webSocket.onerror = (e) => this.doError(e);
    }

    removeBind() {
        if (this.webSocket != null) {
            this.webSocket.onmessage = null;
            this.webSocket.onclose = null;
            this.webSocket.onerror = null;
        }
    }

    doSocketFrame(socketFrame) {
        if (socketFrame.type === MESSAGE) {
            this.doMessage(socketFrame);
        } else if (socketFrame.type === RESPONSE) {
            this.doResponse(socketFrame);
        } else if (socketFrame.type === ACK) {
            this.doAck(socketFrame);
        }
    }

    closeWebSocket() {
        if (this.webSocket != null && this.webSocket.readyState !== WebSocket.CLOSED) {
            this.webSocket.close();
        }
    }

    isClosed() {
        return this.webSocket == null || this.webSocket.readyState === WebSocket.CLOSED;
    }

    send(socketFrame, options) {
    }

    setResponseCallback(socketFrame, responseCallback) {
    }

    doMessage(socketFrame) {
    }

    doResponse(socketFrame) {
    }

    doAck(ackFrame) {
    }

    doClose(v) {
    }

    doError(e) {
    }

}

export {ScxSocketBase};
