'use strict';
const redis = require('redis');

class redisDb {

    static getInstance() {
        if (!redisDb.instance) redisDb.instance = new redisDb();
        return redisDb.instance;
    }

    constructor() {
        this.dbClient = '';
        this.connect();
        console.log(`[redis] ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`);
    }

    connect() {  /*连接数据库*/
        if (!this.dbClient) {
            this.dbClient = redis.createClient();
            this.dbClient.on('error', function (err) {
                console.log('redis error：' + err);
            });
            this.dbClient.on('connect', function () {
                console.log('redis连接成功...')
            });
        }
    }

    /**
     * @param dbNum 库号
     * @param key 键
     * @param value 值
     * @param expire 过期时间（单位：秒，可为空，为空则不过期）
     */
    set(dbNum, key, value, expire) {
        return new Promise((resolve, reject) => {
            this.dbClient.select(dbNum, (err) => {
                if (err) {
                    reject(err)
                    return;
                }
                this.dbClient.set(key, value, (err, res) => {
                    if (err) {
                        console.log('redis插入失败：' + err);
                        reject(err);
                        return;
                    }
                    if (!isNaN(expire) && expire > 0) {
                        this.dbClient.expire(key, parseInt(expire));
                    }
                    resolve(res);
                })

            })
        })
    }

    /**
     * @param dbNum 库号
     * @param key 键
     */
    get(dbNum, key) {
        return new Promise((resolve, reject) => {
            this.dbClient.select(dbNum, (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                this.dbClient.get(key, (err, res) => {
                    if (err) {
                        reject(err);
                        return
                    }
                    resolve(res);
                })
            })
        })
    }

}

module.exports = redisDb.getInstance();