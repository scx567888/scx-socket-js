import {SendOptions} from "./SendOptions.js";


class RequestOptions extends SendOptions {

    #requestTimeout;

    constructor() {
        super();
        this.#requestTimeout = 1000 * 10; // 默认请求超时 10 秒
    }

    getRequestTimeout() {
        return this.#requestTimeout;
    }

    setRequestTimeout(requestTimeout) {
        this.#requestTimeout = requestTimeout;
        return this;
    }

}

export {
    RequestOptions,
};
