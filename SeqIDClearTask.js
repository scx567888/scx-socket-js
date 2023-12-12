class SeqIDClearTask {

    checker;
    key;
    clearTimeout;

    constructor(key, checker) {
        this.key = key;
        this.checker = checker;
    }

    start() {
        this.cancel();
        this.clearTimeout = setTimeout(() => this.clear(), this.checker.getSeqIDClearTimeout());
    }

    cancel() {
        if (this.clearTimeout != null) {
            clearTimeout(this.clearTimeout);
            this.clearTimeout = null;
        }
    }

    clear() {
        this.checker.seqIDClearTaskMap.delete(this.key);
    }

}

export {SeqIDClearTask};
