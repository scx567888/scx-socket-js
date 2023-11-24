class SeqIDClearTask {

    scxSocket;
    seqID;

    constructor(seqID, scxSocket) {
        this.seqID = seqID;
        this.scxSocket = scxSocket;
    }

    startClearTask() {
        setTimeout(() => this.clear(), 1000 * 30);
    }

    clear() {
        this.scxSocket.seqIDClearTaskMap.delete(this.seqID);
    }

}

export {SeqIDClearTask};
