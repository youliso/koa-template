'use strict';
const {join} = require('path');
const log4js = require('log4js');

class logger {

    static getInstance() {
        if (!logger.instance) logger.instance = new logger();
        return logger.instance;
    }

    constructor() {
        console.log(`[logger] ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`);
        log4js.configure({
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

    async access(ctx, next) {
        log4js.getLogger('access').info(`${ctx.originalUrl} ${ctx.header.host} ${ctx.header['user-agent']}`);
        await next();
    }

    error(e) {
        log4js.getLogger('error').error(e);
    }

    info(e) {
        log4js.getLogger('info').info(e);
    }

}

module.exports = logger.getInstance();