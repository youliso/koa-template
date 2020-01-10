'use strict';

class timer {
    constructor(db) {
        this.db = db;
        this.timer_test();
    }

    //test
    timer_test() {
        setInterval(() => {
        }, 1000)
    }
}

module.exports = timer;