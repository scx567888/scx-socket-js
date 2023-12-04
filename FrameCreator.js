import {ScxSocketFrame} from "./ScxSocketFrame.js";
import {ACK, MESSAGE, PING, PONG, RESPONSE} from "./ScxSocketFrameType.js";

//todo 同步完成
class FrameCreator {

    seqID;

    constructor() {
        this.seqID = 0;
    }

    static createPingFrame() {
        let pingFrame = new ScxSocketFrame();
        pingFrame.type = PING;
        return pingFrame;
    }

    static createPongFrame() {
        let pongFrame = new ScxSocketFrame();
        pongFrame.type = PONG;
        return pongFrame;
    }

    static createAckFrame(ack_id, payload = null) {
        let ackFrame = new ScxSocketFrame();
        ackFrame.type = ACK;
        ackFrame.ack_id = ack_id;
        ackFrame.payload = payload;
        return ackFrame;
    }

    createBaseFrame(content, options) {
        let baseFrame = new ScxSocketFrame();
        baseFrame.seq_id = this.seqID++;
        baseFrame.now = new Date().getTime();
        baseFrame.need_ack = options.getNeedAck();
        baseFrame.payload = content;
        return baseFrame;
    }

    createMessageFrame(content, options) {
        let messageFrame = this.createBaseFrame(content, options);
        messageFrame.type = MESSAGE;
        return messageFrame;
    }

    createEventFrame(eventName, payload, options) {
        let eventFrame = this.createMessageFrame(payload, options);
        eventFrame.event_name = eventName;
        return eventFrame;
    }

    createRequestFrame(eventName, payload, options) {
        let requestFrame = this.createEventFrame(eventName, payload, options);
        requestFrame.need_response = true;
        return requestFrame;
    }

    createResponseFrame(ack_id, payload, options) {
        let responseFrame = this.createBaseFrame(payload, options);
        responseFrame.type = RESPONSE;
        responseFrame.ack_id = ack_id;
        return responseFrame;
    }

}

const PING_FRAME = FrameCreator.createPingFrame();
const PONG_FRAME = FrameCreator.createPongFrame();

export {FrameCreator, PING_FRAME, PONG_FRAME};
