import {ScxSocketOptions} from "./ScxSocketOptions.js";

class PingPongOptions extends ScxSocketOptions {

    #pingInterval;
    #pingTimeout;

    constructor() {
        super();
        this.#pingInterval = 1000 * 5; // 心跳 间隔 5 秒
        this.#pingTimeout = 1000 * 5; // 心跳 超时 5 秒
    }

    getPingInterval() {
        return this.#pingInterval;
    }

    setPingInterval(pingInterval) {
        this.#pingInterval = pingInterval;
        return this;
    }

    getPingTimeout() {
        return this.#pingTimeout;
    }

    setPingTimeout(pingTimeout) {
        this.#pingTimeout = pingTimeout;
        return this;
    }

}

export {
    PingPongOptions,
};
