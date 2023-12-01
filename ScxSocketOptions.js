//同步完成 23/12/01
class ScxSocketOptions {
    pingInterval;

    pingTimeout;

    seqIDClearTimeout;

    constructor() {
        this.pingInterval = 1000 * 5;
        this.pingTimeout = 1000 * 5;
        this.seqIDClearTimeout = 1000 * 60 * 10;
    }

    getPingInterval() {
        return this.pingInterval;
    }

    setPingInterval(pingInterval) {
        this.pingInterval = pingInterval;
        return this;
    }

    getPingTimeout() {
        return this.pingTimeout;
    }

    setPingTimeout(pingTimeout) {
        this.pingTimeout = pingTimeout;
        return this;
    }

    getSeqIDClearTimeout() {
        return this.seqIDClearTimeout;
    }

    setSeqIDClearTimeout(seqIDClearTimeout) {
        this.seqIDClearTimeout = seqIDClearTimeout;
        return this;
    }
    
}

export {ScxSocketOptions};
