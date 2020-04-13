'use strict';
const schedule = require('node-schedule');
const _ = require('./original');

const Map = {
    //test1
    test1: (is) => {
        if (is) return 1000 * 60 * 60 * 24; //毫秒、秒、分、时
        console.log('test1');
    },
    //test2
    test2: (is) => {
        if (is) return '0 * * * * *'; //秒、分、时、日、月、周几
        console.log('test2');
    }
};

class timer {

    static getInstance() {
        if (!timer.instance) timer.instance = new timer();
        return timer.instance;
    }

    constructor() {
    }

    start() {
        console.log('[timer]...');
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