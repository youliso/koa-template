import {join} from 'path';
import {configure, getLogger} from 'log4js';

configure({
    appenders: {
        access: {
            type: 'dateFile',
            pattern: '-yyyy-MM-dd.log',
            filename: join('logs/', 'access.log')
        },
        error: {
            type: 'dateFile',
            pattern: '-yyyy-MM-dd.log',
            filename: join('logs/', 'error.log')
        },
        info: {
            type: 'dateFile',
            pattern: '-yyyy-MM-dd.log',
            filename: join('logs/', 'info.log')
        },
        out: {
            type: 'console'
        }
    },
    categories: {
        default: {appenders: ['out'], level: 'info'},
        access: {appenders: ['access'], level: 'info'},
        error: {appenders: ['error'], level: 'WARN'},
        info: {appenders: ['info'], level: 'info'}
    }
})

export default class Logger {

    constructor() {
    }

    static access(e: unknown) {
        getLogger('access').info(e);
    }

    static error(e: unknown) {
        getLogger('error').error(e);
    }

    static info(e: unknown) {
        getLogger('info').info(e);
    }
}
