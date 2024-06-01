import {SendOptions} from "./SendOptions.js";
import {ScxSocketFrame, Type} from "./ScxSocketFrame.js";
import {ScxSocketStatus} from "./ScxSocketStatus.js";
import {ScxSocketRequest} from "./ScxSocketRequest.js";

class ScxSocket {

    webSocket;
    #clientID;
    options;
    status;

    eventHandlerMap;
    #onMessage;
    #onClose;
    #onError;

    constructor(webSocket, clientID, options, status = new ScxSocketStatus(options)) {
        this.webSocket = webSocket;
        this.#clientID = clientID;
        this.options = options;
        this.status = status;
        this.eventHandlerMap = new Map();
        this.#onMessage = null;
        this.#onClose = null;
        this.#onError = null;
    }


//***************** 对外属性 ******************

    clientID() {
        return this.#clientID;
    }

//***************** 发送事件 ********************

    send(socketFrame, options) {
        this.status.frameSender.send(socketFrame, options, this);
    }

    sendResponse(ack_id, responseData) {
        let sendOptions = new SendOptions();
        let responseFrame = this.status.frameCreator.createResponseFrame(ack_id, responseData, sendOptions);
        this.send(responseFrame, sendOptions);
    }

    sendAck(ack_id) {
        let ackFrame = this.status.frameCreator.createAckFrame(ack_id);
        this.webSocket.send(ackFrame.toJson());
    }

//*********************** 设置事件方法 ***********************

    onMessage(onMessage) {
        this.#onMessage = onMessage;
    }

    onClose(onClose) {
        this.#onClose = onClose;
        //为了解决 绑定事件为完成是 连接就被关闭 从而无法触发 onClose 事件
        //此处绑定的意义在于如果当前 webSocket 已经被关闭则永远无法触发 onClose 事件
        //但是我们在这里调用 vertx 的绑定会触发异常 可以在外层进行 异常捕获然后进行对应的修改
        this.webSocket.onclose = (c) => this.doClose(c);
    }

    onError(onError) {
        this.#onError = onError;
        //同 onClose
        this.webSocket.onerror = (e) => this.doError(e);
    }

    onEvent(eventName, onEvent) {
        this.eventHandlerMap.put(eventName, onEvent);
    }

    removeEvent(eventName) {
        this.eventHandlerMap.delete(eventName);
    }

//********************* 内部事件 *********************

    doSocketFrame(socketFrame) {
        if (socketFrame.type === Type.MESSAGE) {
            this.doMessage(socketFrame);
        } else if (socketFrame.type === Type.RESPONSE) {
            this.doResponse(socketFrame);
        } else if (socketFrame.type === Type.ACK) {
            this.doAck(socketFrame);
        }
    }

    doMessage(socketFrame) {
        // ACK 应第一时间返回
        if (socketFrame.need_ack) {
            this.sendAck(socketFrame.seq_id);
        }
        if (!socketFrame.event_name) {
            this.callOnMessageWithCheckDuplicate(socketFrame);
        } else {
            this.callOnEventWithCheckDuplicate(socketFrame);
        }

    }

    doResponse(socketFrame) {
        // ACK 应第一时间返回
        if (socketFrame.need_ack) {
            this.sendAck(socketFrame.seq_id);
        }
        this.status.requestManager.success(socketFrame);
    }

    doAck(ackFrame) {
        this.status.frameSender.clearSendTask(ackFrame);

    }

    doClose(v) {
        this.close();
        //呼叫 onClose 事件
        this._callOnClose(v);
    }

    doError(e) {
        this.close();
        //呼叫 onClose 事件
        this._callOnError(e);
    }

//********************** 生命周期方法 ********************

    bind() {
        this.webSocket.onmessage = (t) => this.doSocketFrame(ScxSocketFrame.fromJson(t.data));
        this.webSocket.close = (c) => this.doClose(c);
        this.webSocket.onerror = (e) => this.doError(e);
    }

    start() {
        //绑定事件
        this.bind();
        //启动所有发送任务
        this.status.frameSender.startAllSendTask(this);
        //启动 校验重复清除任务
        this.status.duplicateFrameChecker.startAllClearTask();
    }

    close() {
        //关闭 连接
        this.closeWebSocket();
        //取消所有重发任务
        this.status.frameSender.cancelAllResendTask();
        //取消 校验重复清除任务
        this.status.duplicateFrameChecker.cancelAllClearTask();
    }

    closeWebSocket() {
        this.webSocket.close();
    }

    isClosed() {
        return this.webSocket.readyState !== WebSocket.OPEN;
    }

//******************* 调用事件 ********************

    callOnMessageWithCheckDuplicate(socketFrame) {
        if (this.status.duplicateFrameChecker.check(socketFrame)) {
            this._callOnMessage(socketFrame.payload);
        }
    }

    callOnEventWithCheckDuplicate(socketFrame) {
        if (this.status.duplicateFrameChecker.check(socketFrame)) {
            this._callOnEvent(socketFrame);
        }
    }

    _callOnMessage(message) {
        if (this.#onMessage != null) {
            //为了防止用户回调 将线程卡死 这里独立创建一个线程处理
            this.#onMessage(message);
        }
    }

    _callOnClose(v) {
        if (this.#onClose != null) {
            //为了防止用户回调 将线程卡死 这里独立创建一个线程处理
            this.#onClose.accept(v);
        }
    }

    _callOnError(e) {
        if (this.#onError != null) {
            //为了防止用户回调 将线程卡死 这里独立创建一个线程处理
            this.#onError.accept(e);
        }
    }

    _callOnEvent(socketFrame) {
        let eventHandler = this.eventHandlerMap.get(socketFrame.event_name);
        if (eventHandler != null) {
            //为了防止用户回调 将线程卡死 这里独立创建一个线程处理
            // Thread.ofVirtual().name("scx-socket-call-on-event").start(() -> {
            //     switch (eventHandler.type) {
            //         case 0 ->
            //             this._callOnEvent0(eventHandler.event0(), socketFrame);
            //         case 1 ->
            //             this._callOnEvent1(eventHandler.event1(), socketFrame);
            //         case 2 ->
            //             this._callOnEvent2(eventHandler.event2(), socketFrame);
            //     }
            // });
        }
    }

    _callOnEvent0(event0, socketFrame) {
        event0.accept(socketFrame.payload);
        if (socketFrame.need_response) {
            this.sendResponse(socketFrame.seq_id, null);
        }
    }

    _callOnEvent1(event1, socketFrame) {
        var responseData = event1.apply(socketFrame.payload);
        if (socketFrame.need_response) {
            this.sendResponse(socketFrame.seq_id, responseData);
        }
    }

    _callOnEvent2(event2, socketFrame) {
        if (socketFrame.need_response) {
            let scxSocketRequest = new ScxSocketRequest(this, socketFrame.seq_id);
            event2.accept(socketFrame.payload, scxSocketRequest);
        } else {
            event2.accept(socketFrame.payload, null);
        }
    }

}

export {ScxSocket};
