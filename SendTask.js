import {AtomicInteger} from "./AtomicInteger.js";
import {getDelayed} from "./Helper.js";

class SendTask {

    #socketFrame;
    #options;
    #sendTimes;
    #sender;
    #resendTask;

    constructor(socketFrame, options, sender) {
        this.#socketFrame = socketFrame;
        this.#options = options;
        this.#sendTimes = new AtomicInteger(0);
        this.#sender = sender;
    }

    start(scxSocket) {
        //当前 websocket 不可用
        if (scxSocket.isClosed()) {
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
        scxSocket.webSocket.send(this.#socketFrame.toJson());

        let currentSendTime = this.#sendTimes.getAndIncrement();
        //当需要 ack 时 创建 重复发送 延时
        if (this.#options.getNeedAck()) {
            //计算重新发送延时
            let resendDelayed = Math.max(getDelayed(currentSendTime), this.#options.getMaxResendDelayed());
            this.#resendTask = setTimeout(() => this.start(scxSocket), resendDelayed);
        } else {
            this.clear();
        }

    }

    /**
     * 取消重发任务
     */
    cancelResend() {
        this.removeConnectFuture();
        if (this.#resendTask != null) {
            clearTimeout(this.#resendTask);
            this.#resendTask = null;
        }
    }

    /**
     * 从任务列表中移除此任务
     */
    clear() {
        this.cancelResend();
        this.#sender.sendTaskMap.delete(this.#socketFrame.seq_id);
    }

    socketFrame() {
        return this.#socketFrame;
    }

    removeConnectFuture() {

    }

}

export {
    SendTask,
};
