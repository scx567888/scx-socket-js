import {ClearTask} from "./ClearTask.js";

class DuplicateFrameChecker {

    clearTaskMap;

    /**
     * 重复帧校验 清理延时
     */
    clearTimeout;

    constructor(clearTimeout) {
        this.clearTaskMap = new Map();
        this.clearTimeout = clearTimeout;
    }

    /**
     * 用来判断是否为重发的消息
     *
     * @param socketFrame socketFrame
     * @return true 是重发 false 不是重发
     */
    check(socketFrame) {
        //只要 need_ack 的都可能会重发 所以需要 做校验
        if (!socketFrame.need_ack) {
            return true;
        }
        let key = socketFrame.seq_id + "_" + socketFrame.now;
        let notDuplicate = false;
        let v = this.clearTaskMap.get(key);
        let task = null;
        if (v == null) {
            notDuplicate = true;
            task = new ClearTask(key, this);
        } else { //否则不改变任何数据
            notDuplicate = false;
            task = v;
        }
        this.clearTaskMap.set(key, task);
        if (notDuplicate) {
            task.start();
        }
        return notDuplicate;
    }

    startAllClearTask() {
        for (let value of this.clearTaskMap.values()) {
            value.start();
        }
    }

    cancelAllClearTask() {
        for (let value of this.clearTaskMap.values()) {
            value.cancel();
        }
    }

    getClearTimeout() {
        return this.clearTimeout;
    }

}

export {DuplicateFrameChecker};
