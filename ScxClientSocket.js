import {PingPongManager} from "./PingPongManager.js";

/**
 * 客户端 Socket 对象
 */
class ScxClientSocket extends PingPongManager {

    socketClient;

    constructor(webSocket, clientID, socketClient, status) {
        super(webSocket, clientID, socketClient.options, status);
        this.socketClient = socketClient;
    }

    doClose(unused) {
        super.doClose(unused);
        this.socketClient.connect();
    }

    doError(e) {
        super.doError(e);
        this.socketClient.connect();
    }

    close() {
        this.socketClient.removeConnectFuture();
        this.socketClient.cancelReconnect();
        this.resetCloseOrErrorBind();
        super.close();
    }

    /**
     * 重置 关闭和 错误的 handler
     */
    resetCloseOrErrorBind() {
        this.webSocket.onclose = null;
        this.webSocket.onerror = null;
    }

    doPingTimeout() {
        //心跳失败直接重连
        this.socketClient.connect();
    }

}

export {
    ScxClientSocket,
};
