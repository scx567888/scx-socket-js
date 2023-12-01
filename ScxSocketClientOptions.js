import {ScxSocketOptions} from "./ScxSocketOptions.js";

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
