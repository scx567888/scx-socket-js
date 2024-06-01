import {ScxSocket} from "./ScxSocket.js";
import {SendOptions} from "./SendOptions.js";
import {RequestOptions} from "./RequestOptions.js";


/**
 * 便于使用的 Socket
 */
class EasyUseSocket extends ScxSocket {

    static DEFAULT_SEND_OPTIONS = new SendOptions();
    static DEFAULT_REQUEST_OPTIONS = new RequestOptions();


    send1(content) {
        super.send(this.status.frameCreator.createMessageFrame(content, EasyUseSocket.DEFAULT_SEND_OPTIONS), EasyUseSocket.DEFAULT_SEND_OPTIONS);
    }


}

export {
    EasyUseSocket,
};
