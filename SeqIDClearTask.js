class SeqIDClearTask {

    scxSocket;
    seqID;
    clearTimeout;

    constructor(seqID, scxSocket) {
        this.seqID = seqID;
        this.scxSocket = scxSocket;
    }

    startClearTask() {
        this.cancelClear();
        this.clearTimeout = setTimeout(() => this.clear(), 1000 * 30);
    }

    clear() {
        this.scxSocket.seqIDClearTaskMap.delete(this.seqID);
    }

    cancelClear() {
        if (this.clearTimeout != null) {
            clearTimeout(this.clearTimeout);
            this.clearTimeout = null;
        }
    }

}

export {SeqIDClearTask};
