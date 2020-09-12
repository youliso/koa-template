import {createClient, RedisClient} from 'redis';

export default class redisDb {
    dbClient: RedisClient = null;

    constructor(db: object) {
        this.dbClient = createClient(db);
        this.dbClient.on('error', err => console.log(err));
    }

    /**
     * @param dbNum 库号
     * @param key 键
     * @param value 值
     * @param expire 过期时间（单位：秒，可为空，为空则不过期）
     */
    set(dbNum: number, key: string, value: string, expire: number) {
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
                        this.dbClient.expire(key, expire);
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
    get(dbNum: number, key: string) {
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

    /**
     * @param dbNum 库号
     * @param key 键
     */
    del(dbNum: number, key: string) {
        return new Promise((resolve, reject) => {
            this.dbClient.select(dbNum, (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                this.dbClient.del(key, (err, res) => {
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
