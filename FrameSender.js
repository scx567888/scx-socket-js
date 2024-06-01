import {SendTask} from "./SendTask.js";

class FrameSender {

    sendTaskMap;

    constructor() {
        this.sendTaskMap = new Map();
    }

    clearSendTask(ackFrame) {
        let sendTask = this.sendTaskMap.get(ackFrame.ack_id);
        if (sendTask != null) {
            sendTask.clear();
        }
    }

    send(socketFrame, options, scxSocket) {
        let sendTask = new SendTask(socketFrame, options, this);
        this.sendTaskMap.set(socketFrame.seq_id, sendTask);
        sendTask.start(scxSocket);
    }

    startAllSendTask(scxSocket) {
        for (let value of this.sendTaskMap.values()) {
            value.start(scxSocket);
        }
    }

    cancelAllResendTask() {
        for (let value of this.sendTaskMap.values()) {
            value.cancelResend();
        }
    }

}

export {
    FrameSender,
};
