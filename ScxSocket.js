import {DEFAULT_SEND_OPTIONS} from "./SendOptions.js";
import {SendTask} from "./SendTask.js";
import {ScxSocketFrame} from "./ScxSocketFrame.js";
import {ACK, HEART_BEAT_PING, HEART_BEAT_PONG, MESSAGE, MESSAGE_NEED_ACK} from "./ScxSocketFrameType.js";
import {SeqIDClearTask} from "./SeqIDClearTask.js";
import {HEART_BEAT_PING_FRAME, HEART_BEAT_PONG_FRAME} from "./ScxSocketHelper.js";

class ScxSocket {

    sendTaskMap;
    seqIDClearTaskMap;
    seqID;
    onMessage;
    onClose;
    onError;
    webSocket;
    heartBeatCloseTimeout;
    heartBeatPingTimeout;

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
                this.doSocketFrame(ScxSocketFrame.fromBytes(o.data));
            } else {
                this.doSocketFrame(ScxSocketFrame.fromJson(o.data));
            }
        };
        this.webSocket.onclose = () => this.doClose();
        this.webSocket.onerror = () => this.doError();
    }

    removeBind() {
        if (this.webSocket != null) {
            this.webSocket.onmessage = null;
            this.webSocket.onclose = null;
            this.webSocket.onerror = null;
        }
    }

    closeWebSocket() {
        if (this.webSocket != null) {
            this.webSocket.close();
        }
    }

    doSocketFrame(socketFrame) {
        //只要收到任何消息就重置 心跳 
        this.resetHeartBeat();
        if (socketFrame.type === ACK) {
            this.doAck(socketFrame);
        } else if (socketFrame.type === MESSAGE_NEED_ACK) {
            this.doMessageNeedAck(socketFrame);
        } else if (socketFrame.type === MESSAGE) {
            this.doMessage(socketFrame);
        } else if (socketFrame.type === HEART_BEAT_PING) {
            this.doHeartBeatPing(socketFrame);
        } else if (socketFrame.type === HEART_BEAT_PONG) {
            this.doHeartBeatPong(socketFrame);
        }
    }

    doClose(v) {
        //取消所有的 sendTask 任务
        this.cancelAllResend();
        if (this.onClose != null) {
            this.onClose(null);
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

    resetHeartBeat() {
        this.cancelHeartBeat();
        this.startHeartBeat();
    }

    /**
     * 发送 心跳 5000 毫秒后收不到则关闭连接
     */
    startHeartBeat() {
        this.heartBeatPingTimeout = setTimeout(() => this.startHeartBeatPing(), 5000);
    }

    startHeartBeatPing() {
        this.sendHeartBeatPing();
        this.heartBeatCloseTimeout = setTimeout(() => this.doHeartBeatFail(), 5000);
    }

    cancelHeartBeat() {
        if (this.heartBeatPingTimeout != null) {
            clearTimeout(this.heartBeatPingTimeout);
            this.heartBeatPingTimeout = null;
        }
        if (this.heartBeatCloseTimeout != null) {
            clearTimeout(this.heartBeatCloseTimeout);
            this.heartBeatCloseTimeout = null;
        }
    }

    /**
     * 心跳连接失败后的操作
     */
    doHeartBeatFail() {
        this.doClose(null);
    }

    doHeartBeatPong(socketFrame) {
        //什么都不做
    }

    doHeartBeatPing(socketFrame) {
        this.sendHeartBeatPong();
    }

    doMessageNeedAck(socketFrame) {
        this.sendAck(socketFrame.seq_id);
        this.doMessage(socketFrame);
    }

    doMessage(socketFrame) {
        if (this.onMessage != null && this.needMessage(socketFrame)) {
            this.onMessage(socketFrame.payload);
        }
    }

    sendHeartBeatPing() {
        this.webSocket.send(HEART_BEAT_PING_FRAME.toJson());
    }

    sendHeartBeatPong() {
        this.webSocket.send(HEART_BEAT_PONG_FRAME.toJson());
    }

}

export {
    ScxSocket,
};
