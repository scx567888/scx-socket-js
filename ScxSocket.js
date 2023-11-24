import {DEFAULT_SEND_OPTIONS} from "./SendOptions.js";
import {SendTask} from "./SendTask.js";
import {ScxSocketFrame} from "./ScxSocketFrame.js";
import {ACK, MESSAGE, MESSAGE_NEED_ACK} from "./ScxSocketFrameType.js";
import {SeqIDClearTask} from "./SeqIDClearTask.js";

class ScxSocket {

    sendTaskMap;
    seqIDClearTaskMap;
    seqID;
    onMessage;
    onClose;
    onError;
    webSocket;

    constructor() {
        this.sendTaskMap = new Map();
        this.seqIDClearTaskMap = new Map();
        this.seqID = 0;
    }

    send(content, options = DEFAULT_SEND_OPTIONS) {
        let messageFrame = this.createMessageFrame(content, options);
        let sendTask = new SendTask(messageFrame, this, options);
        this.sendTaskMap.set(messageFrame.seq_id, sendTask);
        sendTask.send();
    }

    createMessageFrame(content, options) {
        let messageFrame = new ScxSocketFrame();
        messageFrame.seq_id = this.seqID++;
        messageFrame.type = options.getNeedAck() ? MESSAGE_NEED_ACK : MESSAGE;
        messageFrame.now = new Date().getTime();
        messageFrame.payload = content;
        return messageFrame;
    }

    sendAck(id) {
        let ackFrame = this.createAckFrame(id);
        this.webSocket.send(ackFrame.toJson());
    }

    createAckFrame(id) {
        let ackFrame = new ScxSocketFrame();
        ackFrame.seq_id = 0;
        ackFrame.type = ACK;
        ackFrame.now = 0;
        ackFrame.payload = id;
        return ackFrame;
    }

    sendAllMessage() {
        for (let value of this.sendTaskMap.values()) {
            value.send();
        }
    }

    sendAllMessageAsync() {
        setTimeout(() => this.sendAllMessage());
    }

    cancelAllResend() {
        for (let value of this.sendTaskMap.values()) {
            value.cancelResend();
        }
    }

    bind(webSocket) {
        this.webSocket = webSocket;
        this.webSocket.onmessage = o => {
            if (o.data instanceof ArrayBuffer) {
                this.doMessage(ScxSocketFrame.fromBytes(o.data));
            } else {
                this.doMessage(ScxSocketFrame.fromJson(o.data));
            }
        };
        this.webSocket.onclose = () => this.doClose();
        this.webSocket.onerror = () => this.doError();
    }

    removeBind() {
        if (this.webSocket != null && !this.webSocket.isClosed()) {
            this.webSocket.onmessage = null;
            this.webSocket.onclose = null;
            this.webSocket.onerror = null;
        }
    }

    closeWebSocket() {
        if (this.webSocket != null && !this.webSocket.isClosed()) {
            this.webSocket.close();
        }
    }

    doMessage(socketFrame) {
        if (socketFrame.type === ACK) {
            this.doAck(socketFrame);
            return;
        }
        if (socketFrame.type === MESSAGE_NEED_ACK) {
            this.sendAck(socketFrame.seq_id);
        }
        //普通消息 直接调用消息消费者
        if (this.onMessage != null && this.needMessage(socketFrame)) {
            this.onMessage(socketFrame.payload);
        }
    }

    doClose(v) {
        //取消所有的 sendTask 任务
        this.cancelAllResend();
        if (this.onClose != null) {
            this.onClose.accept(null);
        }
    }

    doError(e) {
        //取消所有的 sendTask 任务
        this.cancelAllResend();
        if (this.onError != null) {
            this.onError.accept(e);
        }
    }

    doAck(ackFrame) {
        let seqID = parseInt(ackFrame.payload);
        let sendTask = this.sendTaskMap.get(seqID);
        if (sendTask != null) {
            sendTask.cancelResend();
            sendTask.removeTask();
        }
    }

    /**
     * 用来判断是否为重发的消息
     *
     * @param socketFrame socketFrame
     * @return true 不是重发 false 为重发
     */
    needMessage(socketFrame) {
        if (socketFrame.type !== MESSAGE_NEED_ACK) {
            return true;
        }
        let seqID = socketFrame.seq_id;
        let task = this.seqIDClearTaskMap.get(seqID);
        if (task == null) {
            let seqIDClearTask = new SeqIDClearTask(seqID, this);
            this.seqIDClearTaskMap.set(seqID, seqIDClearTask);
            seqIDClearTask.startClearTask();
            return true;
        } else {
            return false;
        }
    }

}

export {
    ScxSocket,
};
