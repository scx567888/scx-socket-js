import {createConnectOptions, getUUID} from "./Helper.js";
import {ScxSocketClientOptions} from "./ScxSocketClientOptions.js";
import {ScxClientSocket} from "./ScxClientSocket.js";


class ScxSocketClient {

    connectOptions;
    clientID;
    options;

    clientSocket;
    #onConnect;
    connectFuture;
    reconnectTimeout;


    constructor(uri, {protocols = [], clientID = getUUID(), options = new ScxSocketClientOptions()} = {}) {
        this.connectOptions = createConnectOptions(uri, protocols, clientID);
        this.clientID = clientID;
        this.options = options;
    }

    onConnect(onConnect) {
        this.#onConnect = onConnect;
    }

    _callOnConnect(clientSocket) {
        if (this.#onConnect != null) {
            //为了防止用户回调 将线程卡死 这里独立创建一个线程处理
            this.#onConnect(clientSocket);
        }
    }

    connect() {
        //关闭上一次连接
        this._closeOldSocket();
        //创建连接
        this.connectFuture = new WebSocket(this.connectOptions.uri, this.connectOptions.protocols);
        this.connectFuture.onopen = (e) => {
            //如果存在旧的 则使用旧的 status
            this.clientSocket = this.clientSocket != null ?
                    new ScxClientSocket(this.connectFuture, this.clientID, this, this.clientSocket.status) :
                    new ScxClientSocket(this.connectFuture, this.clientID, this);

            this.clientSocket.start();
            this._callOnConnect(this.clientSocket);
        };
        this.connectFuture.onclose = () => {
            this.reconnect();
        };
        this.connectFuture.onerror = () => {
            this.reconnect();
        };
    }

    reconnect(e) {
        //如果当前已经存在一个重连进程 则不进行重连
        if (this.reconnectTimeout != null) {
            return;
        }
        console.warn("WebSocket 重连中... CLIENT_ID : " + this.clientID);
        this.reconnectTimeout = setTimeout(() => {  //没连接上会一直重连，设置延迟为5000毫秒避免请求过多
            this.reconnectTimeout = null;
            this.connect();
        }, this.options.getReconnectTimeout());
    }

    cancelReconnect() {
        if (this.reconnectTimeout != null) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }
    }

    removeConnectFuture() {
        if (this.connectFuture != null) {
            //只有当未完成的时候才设置
            this.connectFuture.onopen = null;
            this.connectFuture.onclose = null;
            this.connectFuture.onerror = null;
            this.connectFuture = null;
        }
    }

    _closeOldSocket() {
        if (this.clientSocket != null) {
            this.clientSocket.close();
        }
    }

}

export {
    ScxSocketClient,
};
