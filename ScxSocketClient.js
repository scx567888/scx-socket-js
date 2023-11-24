import {getUUID, initConnectOptions} from "./ScxSocketHelper.js";
import {ScxSocket} from "./ScxSocket.js";

class ScxSocketClient extends ScxSocket {

    connectOptions;
    clientID;
    onOpen;

    constructor(url, protocols = []) {
        super();
        this.clientID = getUUID();
        this.connectOptions = initConnectOptions(url, protocols, this.clientID);
    }

    cancelReconnect() {
        if (this.reconnectTimeout != null) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }
    }

    connect() {
        if (this.webSocket != null && this.webSocket.readyState === WebSocket.CONNECTING) {
            return;
        }
        this.close();
        this.webSocket = new WebSocket(this.connectOptions.uri, this.connectOptions.protocols);
        this.webSocket.binaryType = "arraybuffer";

        this.webSocket.onopen = (o) => {
            this.bind(this.webSocket);
            this.resetHeartBeat();
            this.sendAllMessageAsync();
            this.doOpen();
        };

        this.webSocket.onerror = () => {
            this.reconnect();
        };
    }

    doOpen() {
        if (this.onOpen != null) {
            this.onOpen(null);
        }
    }

    doClose(unused) {
        super.doClose(unused);
        this.reconnect();
    }

    doError(e) {
        super.doError(e);
        this.reconnect();
    }

    reconnect() {
        //如果当前已经存在一个重连进程 则不进行重连
        if (this.reconnectTimeout != null) {
            return;
        }
        console.warn("WebSocket 重连中... " + new Date());
        this.reconnectTimeout = setTimeout(() => {  //没连接上会一直重连，设置延迟为5000毫秒避免请求过多
            this.reconnectTimeout = null;
            this.connect();
        }, 5000);
    }

    close() {
        this.cancelReconnect();
        this.removeBind();
        this.closeWebSocket();
        this.cancelHeartBeat();
    }

    doHeartBeatFail() {
        //心跳失败直接重连
        this.connect();
    }

}

export {
    ScxSocketClient,
};
