import {getUUID, initConnectOptions} from "./ScxSocketHelper.js";
import {PingPongManager} from "./PingPongManager.js";
import {ScxSocketClientOptions} from "./ScxSocketClientOptions.js";

class ScxSocketClient extends PingPongManager {

    #connectOptions;
    #clientID;
    #clientOptions;
    #reconnectTimeout;
    #connectFuture;
    #onOpen;

    constructor(url, {protocols = [], clientID = getUUID(), clientOptions = new ScxSocketClientOptions()} = {}) {
        super(clientOptions);
        this.#clientOptions = clientOptions;
        this.#clientID = clientID;
        this.#connectOptions = initConnectOptions(url, protocols, this.#clientID);
    }

    removeConnectFuture() {
        if (this.webSocket != null) {
            this.webSocket.onopen = null;
            this.webSocket.onerror = null;
            this.webSocket = null;
        }
    }

    onOpen(onOpen) {
        this.#onOpen = onOpen;
        return this;
    }

    cancelReconnect() {
        if (this.#reconnectTimeout != null) {
            clearTimeout(this.#reconnectTimeout);
            this.#reconnectTimeout = null;
        }
    }

    connect() {
        //当前已经存在一个连接中的任务
        if (this.webSocket != null && this.webSocket.readyState === WebSocket.CONNECTING) {
            return;
        }
        //关闭上一次连接
        this.close();
        this.webSocket = new WebSocket(this.#connectOptions.uri, this.#connectOptions.protocols);
        this.webSocket.binaryType = "arraybuffer";

        this.webSocket.onopen = (o) => {
            this.start(this.webSocket);
            this.doOpen();
        };
        this.webSocket.onerror = (e) => {
            this.reconnect();
        };
    }

    doOpen() {
        this.callOnOpen(null);
    }

    doClose(unused) {
        super.doClose(unused);
        this.connect();
    }

    doError(e) {
        super.doError(e);
        this.connect();
    }

    reconnect() {
        //如果当前已经存在一个重连进程 则不进行重连
        if (this.#reconnectTimeout != null) {
            return;
        }
        console.warn("WebSocket 重连中... " + new Date());
        this.#reconnectTimeout = setTimeout(() => {  //没连接上会一直重连，设置延迟为5000毫秒避免请求过多
            this.#reconnectTimeout = null;
            this.connect();
        }, this.#clientOptions.getReconnectTimeout());
    }

    close() {
        this.removeConnectFuture();
        this.cancelReconnect();
        super.close();
    }

    clientID0() {
        return this.#clientID;
    }

    doPingTimeout() {
        //心跳失败直接重连
        this.connect();
    }

    callOnOpen(v) {
        if (this.#onOpen != null) {
            this.#onOpen(v);
        }
    }

    callOnOpenAsync(v) {
        if (this.#onOpen != null) {
            setTimeout(() => this.#onOpen(v));
        }
    }

}

export {
    ScxSocketClient,
};
