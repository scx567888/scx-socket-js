import {SendTask} from "./SendTask.js";
import {EventManager} from "./EventManager.js";

//todo 同步完成
class ScxSocket extends EventManager {

    sendTaskMap;

    constructor(options) {
        super(options);
        this.sendTaskMap = new Map();
    }

    send(socketFrame, options) {
        let sendTask = new SendTask(socketFrame, options, this);
        this.sendTaskMap.set(socketFrame.seq_id, sendTask);
        sendTask.start();
    }

    startAllSendTask() {
        for (let value of this.sendTaskMap.values()) {
            value.start();
        }
    }

    cancelAllResendTask() {
        for (let value of this.sendTaskMap.values()) {
            value.cancelResend();
        }
    }

    startAllSendTaskAsync() {
        setTimeout(() => this.startAllSendTask());
    }

    cancelAllResendTaskAsync() {
        setTimeout(() => this.cancelAllResendTask());
    }


    doMessage(socketFrame) {
        // ACK 应第一时间返回
        if (socketFrame.need_ack) {
            this.sendAck(socketFrame.seq_id);
        }
        if (!socketFrame.event_name) {
            this.callOnMessageWithCheckDuplicateAsync(socketFrame);
        } else {
            this.callOnEventWithCheckDuplicateAsync(socketFrame);
        }
    }


    doResponse(socketFrame) {
        // ACK 应第一时间返回
        if (socketFrame.need_ack) {
            this.sendAck(socketFrame.seq_id);
        }
        this.callResponseCallbackAsync(socketFrame);
    }

    doAck(ackFrame) {
        let sendTask = this.sendTaskMap.get(ackFrame.ack_id);
        if (sendTask != null) {
            sendTask.clear();
        }
    }

    doClose(v) {
        this.close();
        //呼叫 onClose 事件
        this.callOnClose(v);
    }

    doError(e) {
        this.close();
        //呼叫 onClose 事件
        this.callOnError(e);
    }

    start(webSocket) {
        this.close();
        //绑定事件
        this.bind(webSocket);
        //启动所有发送任务
        this.startAllSendTask();
        //启动 校验重复清除任务
        this.duplicateFrameChecker.startAllClearTask();
    }

    close() {
        //移除绑定事件
        this.removeBind();
        //关闭 连接
        this.closeWebSocket();
        //取消所有重发任务
        this.cancelAllResendTask();
        //取消 校验重复清除任务
        this.duplicateFrameChecker.cancelAllClearTask();
    }

}

export {
    ScxSocket,
};
