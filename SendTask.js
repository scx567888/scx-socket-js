import {getDelayed} from "./ScxSocketHelper.js";
import {AtomicInteger} from "./AtomicInteger.js";

class SendTask {

    #socketFrame;
    #options;
    #scxSocket;
    #sendTimes;
    #resendThread;
    #sendFuture;

    constructor(socketFrame, options, scxSocket) {
        this.#socketFrame = socketFrame;
        this.#options = options;
        this.#scxSocket = scxSocket;
        this.#sendTimes = new AtomicInteger(0);
    }

    start() {
        //当前 websocket 不可用
        if (this.#scxSocket.isClosed()) {
            return;
        }
        //当前已经存在一个 发送中(并未完成发送) 的任务
        if (this.#sendFuture != null) {
            return;
        }
        //超过最大发送次数
        if (this.#sendTimes.get() > this.#options.getMaxResendTimes()) {
            if (this.#options.getGiveUpIfReachMaxResendTimes()) {
                this.clear();
            }
            return;
        }
        //根据不同序列化配置发送不同消息
        try {
            this.#sendFuture = true;
            this.#scxSocket.webSocket.send(this.#socketFrame.toJson());
            let currentSendTime = this.#sendTimes.getAndIncrement();
            //当需要 ack 时 创建 重复发送 延时
            if (this.#options.getNeedAck()) {
                this.#resendThread = setTimeout(() => this.start(), Math.max(getDelayed(currentSendTime), this.#options.getMaxResendDelayed()));
            } else {
                this.clear();
            }
        } catch (e) {

        } finally {
            this.#sendFuture = null;
        }

    }

    /**
     * 取消重发任务
     */
    cancelResend() {
        this.removeConnectFuture();
        if (this.#resendThread != null) {
            clearTimeout(this.#resendThread);
            this.#resendThread = null;
        }
    }

    /**
     * 从任务列表中移除此任务
     */
    clear() {
        this.cancelResend();
        this.#scxSocket.sendTaskMap.delete(this.#socketFrame.seq_id);
    }

    socketFrame() {
        return this.#socketFrame;
    }

    removeConnectFuture() {
        if (this.#sendFuture != null) {
            this.#sendFuture = null;
        }
    }

}

export {
    SendTask,
};
