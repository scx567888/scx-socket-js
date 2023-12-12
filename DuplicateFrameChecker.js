import {SeqIDClearTask} from "./SeqIDClearTask.js";

class DuplicateFrameChecker {

    seqIDClearTaskMap;

    /**
     * 重复帧校验 清理延时
     */
    seqIDClearTimeout;

    constructor(seqIDClearTimeout) {
        this.seqIDClearTaskMap = new Map();
        this.seqIDClearTimeout = seqIDClearTimeout;
    }

    /**
     * 用来判断是否为重发的消息
     *
     * @param socketFrame socketFrame
     * @return true 是重发 false 不是重发
     */
    checkDuplicate(socketFrame) {
        //只要 need_ack 的都可能会重发 所以需要 做校验
        if (!socketFrame.need_ack) {
            return true;
        }
        let key = socketFrame.seq_id + "_" + socketFrame.now;
        let task = this.seqIDClearTaskMap.get(key);
        if (task == null) {
            let seqIDClearTask = new SeqIDClearTask(key, this);
            this.seqIDClearTaskMap.set(key, seqIDClearTask);
            seqIDClearTask.start();
            return true;
        } else {
            return false;
        }
    }

    startAllClearTask() {
        for (let value of this.seqIDClearTaskMap.values()) {
            value.start();
        }
    }

    cancelAllClearTask() {
        for (let value of this.seqIDClearTaskMap.values()) {
            value.cancel();
        }
    }

    startAllClearTaskAsync() {
        setTimeout(() => this.startAllClearTask());
    }

    cancelAllClearTaskAsync() {
        setTimeout(() => this.cancelAllClearTask());
    }

    getSeqIDClearTimeout() {
        return this.seqIDClearTimeout;
    }

}

export {DuplicateFrameChecker};
