class ScxSocketOptions {

    /**
     * 重复帧检查器清除超时
     */
    #duplicateFrameCheckerClearTimeout;

    constructor() {
        this.#duplicateFrameCheckerClearTimeout = 1000 * 60 * 10;// 默认 10 分钟
    }

    getDuplicateFrameCheckerClearTimeout() {
        return this.#duplicateFrameCheckerClearTimeout;
    }

    setDuplicateFrameCheckerClearTimeout(duplicateFrameCheckerClearTimeout) {
        this.#duplicateFrameCheckerClearTimeout = duplicateFrameCheckerClearTimeout;
        return this;
    }

}

export {
    ScxSocketOptions,
};
