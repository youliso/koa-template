import {join} from 'path';
import {configure, getLogger} from 'log4js';

class Logger {
    private static instance: Logger;

    static getInstance() {
        if (!Logger.instance) Logger.instance = new Logger();
        return Logger.instance;
    }

    constructor() {
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
    }

    access(e: unknown) {
        getLogger('access').info(e);
    }

    error(e: unknown) {
        getLogger('error').error(e);
    }

    info(e: unknown) {
        getLogger('info').info(e);
    }
}

export default Logger.getInstance();
