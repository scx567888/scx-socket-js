/**
 * ScxSocket 帧结构
 */
class ScxSocketFrame {

    seq_id;
    type;
    now;
    event_name;
    payload;
    ack_id;
    need_ack;
    need_response;

    static fromJson(json) {
        let obj = JSON.parse(json);
        return Object.assign(new ScxSocketFrame, obj);
    }

    toJson() {
        return JSON.stringify(this);
    }

}

export {
    ScxSocketFrame,
};
