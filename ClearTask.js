class ClearTask {

    checker;
    key;
    clearTimeout;

    constructor(key, checker) {
        this.key = key;
        this.checker = checker;
    }

    start() {
        this.cancel();
        this.clearTimeout = setTimeout(() => this.clear(), this.checker.getClearTimeout());
    }

    cancel() {
        if (this.clearTimeout != null) {
            clearTimeout(this.clearTimeout);
            this.clearTimeout = null;
        }
    }

    clear() {
        this.checker.clearTaskMap.delete(this.key);
    }

}

export {ClearTask};
