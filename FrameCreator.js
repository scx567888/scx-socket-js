import {ScxSocketFrame, Type} from "./ScxSocketFrame.js";
import {AtomicInteger} from "./AtomicInteger.js";

class FrameCreator {

    nowSeqID;

    constructor() {
        this.nowSeqID = new AtomicInteger(0);
    }

    createPingFrame() {
        let pingFrame = new ScxSocketFrame();
        pingFrame.type = Type.PING;
        return pingFrame;
    }

    createPongFrame() {
        let pongFrame = new ScxSocketFrame();
        pongFrame.type = Type.PONG;
        return pongFrame;
    }

    createAckFrame(ack_id) {
        let ackFrame = new ScxSocketFrame();
        ackFrame.type = Type.ACK;
        ackFrame.ack_id = ack_id;
        return ackFrame;
    }

    createAckFrame1(ack_id, payload) {
        let ackFrame = this.createAckFrame(ack_id);
        ackFrame.payload = payload;
        return ackFrame;
    }

    createBaseFrame(content, options) {
        let baseFrame = new ScxSocketFrame();
        baseFrame.seq_id = this.nowSeqID.getAndIncrement();
        baseFrame.now = new Date().getTime();
        baseFrame.need_ack = options.getNeedAck();
        baseFrame.payload = content;
        return baseFrame;
    }

    createMessageFrame(content, options) {
        let messageFrame = this.createBaseFrame(content, options);
        messageFrame.type = Type.MESSAGE;
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
        responseFrame.type = Type.RESPONSE;
        responseFrame.ack_id = ack_id;
        return responseFrame;
    }

}

export {
    FrameCreator,
};
