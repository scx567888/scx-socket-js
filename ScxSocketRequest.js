class ScxSocketRequest {

    #scxSocket;
    ack_id;
    alreadyResponse;
     
    constructor(scxSocket, ack_id) {
        this.#scxSocket = scxSocket;
        this.ack_id = ack_id;
        this.alreadyResponse = false;
    }

    response(payload) {
        if (this.alreadyResponse) {
            throw new Error("已经响应过 !!!");
        } else {
            this.alreadyResponse = true;
            this.#scxSocket.sendResponse(this.ack_id, payload);
        }
    }

}

export {
    ScxSocketRequest,
};
