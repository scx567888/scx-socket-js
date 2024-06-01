import {RequestTask} from "./RequestTask.js";

class RequestManager {

    responseTaskMap;

    constructor() {
        this.responseTaskMap = new Map();
    }

    setResponseCallback(socketFrame, responseCallback, options) {
        let requestTask = new RequestTask(responseCallback, this, options, socketFrame.seq_id);
        this.responseTaskMap.set(socketFrame.seq_id, requestTask);
        requestTask.start();
    }

    success(socketFrame) {
        let requestTask = this.responseTaskMap.get(socketFrame.ack_id);
        if (requestTask != null) {
            requestTask.success(socketFrame.payload);
        }
    }

}

export {
    RequestManager,
};
