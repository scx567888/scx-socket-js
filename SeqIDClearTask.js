class SeqIDClearTask {

    checker;
    seqID;
    clearTimeout;

    constructor(seqID, checker) {
        this.seqID = seqID;
        this.checker = checker;
    }

    start() {
        this.cancel();
        this.clearTimeout = setTimeout(() => this.clear(), checker.getSeqIDClearTimeout());
    }

    cancel() {
        if (this.clearTimeout != null) {
            clearTimeout(this.clearTimeout);
            this.clearTimeout = null;
        }
    }

    clear() {
        this.checker.seqIDClearTaskMap.delete(this.seqID);
    }

}

export {SeqIDClearTask};
