import {createPool, Pool, escape} from 'mysql2';

export default class Mysqldb {
    dbClient: Pool;

    constructor(db: object) {
        this.dbClient = createPool(db);
    }

    //将结果已对象数组返回
    row(sql: string, params: object) {
        const promisePool = this.dbClient.promise();
        return new Promise((resolve, reject) => {
            promisePool.query(sql, params)
                .then(res => {
                    resolve(res);
                    // @ts-ignore
                    promisePool.release();
                })
                .catch(err => {
                    reject(err);
                    // @ts-ignore
                    promisePool.release();
                });
        });
    }

    //返回一个对象
    first(sql: string, params: object) {
        const promisePool = this.dbClient.promise();
        return new Promise((resolve, reject) => {
            promisePool.query(sql, params)
                .then(res => {
                    resolve(res[0] || null);
                    // @ts-ignore
                    promisePool.release();
                })
                .catch(err => {
                    reject(err);
                    // @ts-ignore
                    promisePool.release();
                });
        });
    }

    //返回单个查询结果
    single(sql: string, params: object) {
        console.log(sql, params)
        const promisePool = this.dbClient.promise();
        return new Promise((resolve, reject) => {
            promisePool.query(sql, params)
                .then(res => {
                    for (let i in res[0]) {
                        resolve(res[0][i] || null);
                        // @ts-ignore
                        promisePool.release();
                        return;
                    }
                    resolve(null);
                    // @ts-ignore
                    promisePool.release();
                })
                .catch(err => {
                    reject(err);
                    // @ts-ignore
                    promisePool.release();
                });
        });
    }

    //执行代码，返回执行结果
    query(sql: string, params: object) {
        const promisePool = this.dbClient.promise();
        return new Promise((resolve, reject) => {
            promisePool.query(sql, params)
                .then(res => {
                    resolve(res);
                    // @ts-ignore
                    promisePool.release();
                })
                .catch(err => {
                    reject(err);
                    // @ts-ignore
                    promisePool.release();
                });
        });
    }

    //执行代码，返回执行结果
    execute(sql: string, params: object) {
        const promisePool = this.dbClient.promise();
        return new Promise(async (resolve, reject) => {
            promisePool.execute(sql, params)
                .then(res => {
                    resolve(res);
                    // @ts-ignore
                    promisePool.release();
                })
                .catch(err => {
                    reject(err);
                    // @ts-ignore
                    promisePool.release();
                });
        })
    }

    /**
     * 防止注入
     * @param {*} c
     **/
    escape(c: unknown) {
        return escape(c);
    }

}
