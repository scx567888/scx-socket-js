import {HEART_BEAT_PING, HEART_BEAT_PONG} from "./ScxSocketFrameType.js";
import {ScxSocketFrame} from "./ScxSocketFrame.js";

/**
 * 生成 uuid
 * @returns {string}
 */
function getUUID() {
    const temp_url = URL.createObjectURL(new Blob());
    const uuid = temp_url.toString();
    URL.revokeObjectURL(temp_url);
    return uuid.substring(uuid.lastIndexOf("/") + 1);
}

const TEXT_DECODER = new TextDecoder("utf-8");

const TEXT_ENCODER = new TextEncoder();

const SCX_SOCKET_CLIENT_ID_KEY = "scx-socket-client-id";

/**
 * 根据次数获取延时时间
 * 根据次数进行 2的 次方倍增 , 如 1, 2 ,4 ,8 ,16 等
 *
 * @param times 次数 (0 起始)
 * @return 延时时间 (毫秒)
 */
function getDelayed(times) {
    return 1000 * (1 << times);
}

function initConnectOptions(uri, protocols, clientID) {
    const newUri = new URL(uri);
    newUri.searchParams.set(SCX_SOCKET_CLIENT_ID_KEY, clientID);
    return {
        uri: newUri,
        protocols: protocols,
    };
}

const HEART_BEAT_PING_FRAME = createHeartBeatPingFrame();
const HEART_BEAT_PONG_FRAME = createHeartBeatPongFrame();

function createHeartBeatPingFrame() {
    let heartBeatFramePing = new ScxSocketFrame();
    heartBeatFramePing.seq_id = 0;
    heartBeatFramePing.type = HEART_BEAT_PING;
    heartBeatFramePing.now = 0;
    heartBeatFramePing.payload = "";
    return heartBeatFramePing;
}

function createHeartBeatPongFrame() {
    let heartBeatFramePong = new ScxSocketFrame();
    heartBeatFramePong.seq_id = 0;
    heartBeatFramePong.type = HEART_BEAT_PONG;
    heartBeatFramePong.now = 0;
    heartBeatFramePong.payload = "";
    return heartBeatFramePong;
}

export {
    TEXT_ENCODER,
    TEXT_DECODER,
    SCX_SOCKET_CLIENT_ID_KEY,
    getUUID,
    getDelayed,
    initConnectOptions,
    HEART_BEAT_PING_FRAME,
    HEART_BEAT_PONG_FRAME,
};
