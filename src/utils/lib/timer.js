'use strict';
const schedule = require('node-schedule');
const _ = require('./original');
const Map = {
    //test1
    test1: async (is) => {
        if (is) return 1000; //毫秒、秒、分、时
        try {
            // console.log('test1');
        } catch (e) {
            _.logger.error(e);
        }
    },
    //test2
    test2: async (is) => {
        if (is) return '* 5 * * * *'; //秒、分、时、日、月、周几
        try {
            // console.log('test2');
        } catch (e) {
            _.logger.error(e);
        }
    }
};

class timer {

    static getInstance() {
        if (!timer.instance) timer.instance = new timer();
        return timer.instance;
    }

    constructor() {
    }

    async start() {
        let that = this;
        for (let i in Map) {
            let timeout = await Map[i](true, that);
            if (typeof timeout === 'number') {
                setInterval(async () => {
                    Map[i](false, that);
                }, timeout)
            } else if (typeof timeout === 'string') {
                schedule.scheduleJob(timeout, async () => {
                    Map[i](false, that);
                });
            }
        }
    }
}

module.exports = timer.getInstance();