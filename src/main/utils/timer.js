'use strict';
const schedule = require('node-schedule');
const _ = require('./original');

const Map = {
    //test1
    test1: (is) => {
        console.log('test1');
        if (is) return 1000 * 60 * 60 * 24;
    },
    //test2
    test2: (is) => {
        console.log('test2');
        if (is) return '10 * * * * *';
    }
};

class timer {

    static getInstance() {
        if (!timer.instance) timer.instance = new timer();
        return timer.instance;
    }

    constructor() {
        console.log('[timer]...');
        this.start();
    }

    start() {
        let that = this;
        for (let i in Map) {
            let timeout = Map[i](true, that);
            if (typeof timeout === 'number') {
                setInterval(() => {
                    Map[i](false, that)
                }, timeout)
            } else if (typeof timeout === 'string') {
                schedule.scheduleJob(timeout, () => {
                    Map[i](false, that)
                });
            }
        }
    }
}

module.exports = timer.getInstance();