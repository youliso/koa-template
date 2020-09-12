import {scheduleJob} from 'node-schedule';
// import fetch from 'node-fetch';
// import {} from 'cheerio';
import _ from './original';

class Timer {
    private static instance: Timer;
    private maps: { [key: string]: (is: boolean) => Promise<number | string> } = {};

    static getInstance() {
        if (!Timer.instance) Timer.instance = new Timer();
        return Timer.instance;
    }

    constructor() {
        this.maps['test1'] = async (is) => {
            if (is) return 1000; //毫秒、秒、分、时
            try {
                // console.log('test1');
            } catch (e) {
                _.logger.error(e);
            }
        };
        this.maps['test2'] = async (is) => {
            if (is) return '* 5 * * * *'; //秒、分、时、日、月、周几
            try {
                // console.log('test2');
            } catch (e) {
                _.logger.error(e);
            }
        };
    }

    async start() {
        let that = this;
        for (let i in this.maps) {
            // @ts-ignore
            let timeout = await this.maps[i](true, that);
            if (typeof timeout === 'number') {
                setInterval(async () => {
                    // @ts-ignore
                    this.maps[i](false, that);
                }, timeout)
            } else if (typeof timeout === 'string') {
                scheduleJob(timeout, async () => {
                    // @ts-ignore
                    this.maps[i](false, that);
                });
            }
        }
    }
}

export default Timer.getInstance();
