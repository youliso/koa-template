'use strict';
const _ = require('./original');
class timer {

    static getInstance() {
        if (!timer.instance) timer.instance = new timer();
        return timer.instance;
    }

    constructor() {
        this.deftimeout = 1000 * 60 * 60 * 24;
        this.Map = [];
        this.start();
        console.log('[timer]...');
    }

    start() {
        let that = this;
        this.Map.map(e => {
            let timeout = eval('this.' + e)(true,that);
            setInterval(() => {
                eval('this.' + e)(false,that)
            }, timeout)
        });
    }

    // //test1
    // test1(is,that) {
    //     console.log('test1');
    //     if (is) return that.deftimeout;
    // }
    //
    // //test2
    // test2(is,that) {
    //     console.log('test2');
    //     if (is) return 1000 * 60 * 60;
    // }
}

module.exports = timer.getInstance();