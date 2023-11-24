import {getDelayed} from "./ScxSocketHelper.js";

class SendTask {

    socketFrame;
    scxSocket;
    options;
    sendTimes;
    resendThread;
    sendFuture;

    constructor(socketFrame, scxSocket, options) {
        this.socketFrame = socketFrame;
        this.scxSocket = scxSocket;
        this.options = options;
    }

    send() {
        //当前 websocket 不可用
        if (this.scxSocket.webSocket == null || this.scxSocket.webSocket.readyState !== WebSocket.OPEN) {
            return;
        }
        //超过最大发送次数
        if (this.sendTimes > this.options.getMaxResendTimes()) {
            if (this.options.getGiveUpIfReachMaxResendTimes()) {
                this.removeTask();
            }
            return;
        }
        //根据不同序列化配置发送不同消息
        if (this.options.getUseJson()) {
            this.sendFuture = this.scxSocket.webSocket.send(this.socketFrame.toJson());
        } else {
            this.sendFuture = this.scxSocket.webSocket.send(this.socketFrame.toBytes());
        }

        let currentSendTime = this.sendTimes++;
        //当需要 ack 时 创建 重复发送 延时
        if (this.options.getNeedAck()) {
            this.resendThread = setTimeout(() => this.send(), Math.max(getDelayed(currentSendTime), this.options.getMaxResendDelayed()));
        } else {
            this.removeTask();
        }

    }

    /**
     * 取消重发任务
     */
    cancelResend() {
        if (this.resendThread != null) {
            clearTimeout(this.resendThread);
            this.resendThread = null;
        }
    }

    /**
     * 从任务列表中移除此任务
     */
    removeTask() {
        this.scxSocket.sendTaskMap.delete(this.socketFrame.seq_id);
    }

}

export {
    SendTask,
};
