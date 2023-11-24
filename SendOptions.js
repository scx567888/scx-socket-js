class SendOptions {

    needAck;

    useJson;

    maxResendTimes;

    maxResendDelayed;

    giveUpIfReachMaxResendTimes;

    constructor() {
        this.needAck = true;
        this.useJson = true;
        this.maxResendTimes = 3;
        this.maxResendDelayed = 10000;
        this.giveUpIfReachMaxResendTimes = true;
    }

    getNeedAck() {
        return this.needAck;
    }

    setNeedAck(needAck) {
        this.needAck = needAck;
        return this;
    }

    getUseJson() {
        return this.useJson;
    }

    setUseJson(useJson) {
        this.useJson = useJson;
        return this;
    }

    getMaxResendTimes() {
        return this.maxResendTimes;
    }

    setMaxResendTimes(maxResendTimes) {
        this.maxResendTimes = maxResendTimes;
        return this;
    }

    getMaxResendDelayed() {
        return this.maxResendDelayed;
    }

    setMaxResendDelayed(maxDelayed) {
        this.maxResendDelayed = maxDelayed;
        return this;
    }

    getGiveUpIfReachMaxResendTimes() {
        return this.giveUpIfReachMaxResendTimes;
    }

    setGiveUpIfReachMaxResendTimes(giveUpIfReachMaxResendTimes) {
        this.giveUpIfReachMaxResendTimes = giveUpIfReachMaxResendTimes;
        return this;
    }
}


const DEFAULT_SEND_OPTIONS = new SendOptions();

export {
    SendOptions, DEFAULT_SEND_OPTIONS,
};
