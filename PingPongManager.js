import {Type} from "./ScxSocketFrame.js";
import {EasyUseSocket} from "./EasyUseSocket.js";

class PingPongManager extends EasyUseSocket {

    #pingPongOptions;
    #ping;
    #pingTimeout;

    constructor(webSocket, clientID, options, status) {
        super(webSocket, clientID, options, status);
        this.#pingPongOptions = options;
    }

    startPingTimeout() {
        this.cancelPingTimeout();
        this.#pingTimeout = setTimeout(() => this.doPingTimeout(), this.options.getPingTimeout() + this.options.getPingInterval());
    }

    cancelPingTimeout() {
        if (this.#pingTimeout != null) {
            clearTimeout(this.#pingTimeout);
            this.#pingTimeout = null;
        }
    }

    startPing() {
        this.cancelPing();
        this.#ping = setTimeout(() => {
            this.sendPing();
            this.startPing();
        }, this.options.getPingInterval());
    }

    cancelPing() {
        if (this.#ping != null) {
            clearTimeout(this.#ping);
            this.#ping = null;
        }
    }

    doSocketFrame(socketFrame) {
        //只要收到任何消息就重置 心跳 
        this.startPing();
        this.startPingTimeout();
        if (socketFrame.type === Type.PING) {
            this.doPing(socketFrame);
        } else if (socketFrame.type === Type.PONG) {
            this.doPong(socketFrame);
        } else {
            super.doSocketFrame(socketFrame);
        }
    }

    start(webSocket) {
        super.start(webSocket);
        //启动心跳
        this.startPing();
        //心跳超时
        this.startPingTimeout();
    }

    close() {
        super.close();
        //取消心跳
        this.cancelPing();
        //取消心跳超时
        this.cancelPingTimeout();
    }

    sendPing() {
        let pingFrame = this.status.frameCreator.createPingFrame();
        this.webSocket.send(pingFrame.toJson());
    }

    sendPong() {
        let pongFrame = this.status.frameCreator.createPongFrame();
        this.webSocket.send(pongFrame.toJson());
    }

    doPing(socketFrame) {
        this.sendPong();
        console.warn("收到 ping");
    }

    doPong(socketFrame) {
        //什么都不做
        console.warn("收到 pong");
    }

    doPingTimeout() {

    }

}

export {
    PingPongManager,
};
