'use strict';
const {join} = require('path');
const log4js = require('log4js');

class logger {

    static getInstance() {
        if (!logger.instance) logger.instance = new logger();
        return logger.instance;
    }

    constructor() {
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

    access(e) {
        log4js.getLogger('access').info(e);
    }

    error(e) {
        log4js.getLogger('error').error(e);
    }

    info(e) {
        log4js.getLogger('info').info(e);
    }

}

module.exports = logger.getInstance();