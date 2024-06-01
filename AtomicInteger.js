class AtomicInteger {

    #value;

    constructor(value = 0) {
        this.#value = value;
    }

    get() {
        return this.#value;
    }

    getAndIncrement() {
        let t = this.#value;
        this.#value = this.#value + 1;
        return t;
    }

}

export {
    AtomicInteger,
};
