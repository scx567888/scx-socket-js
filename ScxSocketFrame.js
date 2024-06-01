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


class Type {
    static MESSAGE = 0;
    static RESPONSE = 1;
    static ACK = 2;
    static PING = 3;
    static PONG = 4;
}

export {
    ScxSocketFrame,
    Type,
};
