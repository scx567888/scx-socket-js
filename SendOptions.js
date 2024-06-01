class SendOptions {

    #needAck;
    #maxResendTimes;
    #maxResendDelayed;
    #giveUpIfReachMaxResendTimes;

    constructor() {
        this.#needAck = true;
        this.#maxResendTimes = 3;
        this.#maxResendDelayed = 1000 * 10;
        this.#giveUpIfReachMaxResendTimes = true;
    }

    getNeedAck() {
        return this.#needAck;
    }

    setNeedAck(needAck) {
        this.#needAck = needAck;
        return this;
    }

    getMaxResendTimes() {
        return this.#maxResendTimes;
    }

    setMaxResendTimes(maxResendTimes) {
        this.#maxResendTimes = maxResendTimes;
        return this;
    }

    getMaxResendDelayed() {
        return this.#maxResendDelayed;
    }

    setMaxResendDelayed(maxDelayed) {
        this.#maxResendDelayed = maxDelayed;
        return this;
    }

    getGiveUpIfReachMaxResendTimes() {
        return this.#giveUpIfReachMaxResendTimes;
    }

    setGiveUpIfReachMaxResendTimes(giveUpIfReachMaxResendTimes) {
        this.#giveUpIfReachMaxResendTimes = giveUpIfReachMaxResendTimes;
        return this;
    }

}

export {
    SendOptions,
};
