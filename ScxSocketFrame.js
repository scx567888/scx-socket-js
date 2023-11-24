import {TEXT_DECODER, TEXT_ENCODER} from "./ScxSocketHelper.js";

/**
 * ScxSocket 帧结构
 */
class ScxSocketFrame {

    seq_id;
    type;
    now;
    payload;

    static fromBytes(bytes) {
        const socketFrame = new ScxSocketFrame();
        let dataView = new DataView(bytes);
        socketFrame.seq_id = dataView.getBigInt64(0);
        socketFrame.type = dataView.getInt8(8);
        socketFrame.now = dataView.getBigInt64(9);
        socketFrame.payload = TEXT_DECODER.decode(new DataView(bytes, 17));
        return socketFrame;
    }

    static fromJson(json) {
        let obj = JSON.parse(json);
        return Object.assign(new ScxSocketFrame, obj);
    }

    toBytes() {
        const head = new ArrayBuffer(17);
        const dv = new DataView(head);
        dv.setBigInt64(0, BigInt(this.seq_id));
        dv.setInt8(8, this.type);
        dv.setBigInt64(9, BigInt(this.now));

        const pb = TEXT_ENCODER.encode(this.payload);
        const bytes = new Uint8Array(17 + pb.byteLength);
        bytes.set(new Uint8Array(head), 0);
        bytes.set(pb, 17);
        return bytes.buffer;
    }

    toJson() {
        return JSON.stringify(this);
    }

}

export {
    ScxSocketFrame,
};
