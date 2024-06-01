class RequestTask {

    responseCallback;
    requestManager;
    options;
    seq_id;
    failTimeout;

    constructor(responseCallback, requestManager, options, seqId) {
        this.responseCallback = responseCallback;
        this.requestManager = requestManager;
        this.options = options;
        this.seq_id = seqId;
    }

    start() {
        this.cancelFail();
        this.failTimeout = setTimeout(() => this.fail(), this.options.getRequestTimeout());
    }

    success(payload) {
        this.clear();
        this.responseCallback(payload, null);
    }

    fail() {
        this.clear();
        this.responseCallback(null, new Error("超时"));
    }

    cancelFail() {
        if (this.failTimeout != null) {
            clearTimeout(this.failTimeout);
            this.failTimeout = null;
        }
    }

    clear() {
        this.cancelFail();
        this.requestManager.responseTaskMap.delete(this.seq_id);
    }

}

export {
    RequestTask,
};
