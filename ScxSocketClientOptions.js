import {ScxSocketOptions} from "./ScxSocketOptions.js";

//同步完成 23/12/01
class ScxSocketClientOptions extends ScxSocketOptions {

    reconnectTimeout;

    constructor() {
        super();
        this.reconnectTimeout = 1000 * 5;
    }

    getReconnectTimeout() {
        return this.reconnectTimeout;
    }

    setReconnectTimeout(reconnectTimeout) {
        this.reconnectTimeout = reconnectTimeout;
        return this;
    }

}

export {ScxSocketClientOptions};
