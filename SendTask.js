import {getDelayed} from "./ScxSocketHelper.js";

//同步完成 23/12/01
class SendTask {
    
    socketFrame;
    options;
    scxSocket;
    sendTimes;
    resendThread;
    sendFuture;

    constructor(socketFrame, options, scxSocket) {
        this.socketFrame = socketFrame;
        this.options = options;
        this.scxSocket = scxSocket;
        this.sendTimes = 0;
    }

    start() {
        //当前 websocket 不可用
        if (this.scxSocket.isClosed()) {
            return;
        }
        //当前已经存在一个 发送中(并未完成发送) 的任务
        if (this.sendFuture != null && !this.sendFuture.isComplete()) {
            return;
        }
        //超过最大发送次数
        if (this.sendTimes > this.options.getMaxResendTimes()) {
            if (this.options.getGiveUpIfReachMaxResendTimes()) {
                this.clear();
            }
            return;
        }
        //根据不同序列化配置发送不同消息
        this.scxSocket.webSocket.send(this.socketFrame.toJson());

        let currentSendTime = this.sendTimes++;
        //当需要 ack 时 创建 重复发送 延时
        if (this.options.getNeedAck()) {
            this.resendThread = setTimeout(()=>this.start(), Math.max(getDelayed(currentSendTime), this.options.getMaxResendDelayed()));
        } else {
            this.clear();
        }

    }

    /**
     * 取消重发任务
     */
    cancelResend() {
        this.removeConnectFuture();
        if (this.resendThread != null) {
            clearTimeout(this.resendThread);
            this.resendThread = null;
        }
    }

    /**
     * 从任务列表中移除此任务
     */
    clear() {
        this.cancelResend();
        this.scxSocket.sendTaskMap.delete(this.socketFrame.seq_id);
    }

    socketFrame0() {
        return this.socketFrame;
    }

    removeConnectFuture() {
        
    }

}

export {
    SendTask,
};
