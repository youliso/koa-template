'use strict';

class timer {
    constructor(db) {
        this.db = db;
        this.count = 0;
        this.timeout = 1000;
        this.IntervalId = setInterval(() => {
            if (this.count === 0) {
                this.start();
                this.count++;
            } else {
                clearInterval(this.IntervalId);
                this.IntervalId = setInterval(() => {
                    this.start();
                    this.count++;
                }, this.timeout)
            }
        }, 0);
    }

    start() {
        console.log(this.count);
    }
}

module.exports = timer;