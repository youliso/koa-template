'use strict';
const mysql = require('mysql2');

class MysqlDb {

    constructor() {
        this.dbClient = '';
    }

    connect(db, logger) {  /*连接数据库*/
        if (!this.dbClient) {
            this.logger = logger;
            this.dbClient = mysql.createPool(db);
        }
    }

    //将结果已对象数组返回
    row(sql, params) {
        const promisePool = this.dbClient.promise();
        return new Promise((resolve, reject) => {
            promisePool.query(sql, params)
                .then(res => {
                    resolve(res);
                    promisePool.end();
                })
                .catch(err => {
                    reject(err);
                    promisePool.end();
                });
        });
    }

    //返回一个对象
    first(sql, params) {
        const promisePool = this.dbClient.promise();
        return new Promise((resolve, reject) => {
            promisePool.query(sql, params)
                .then(res => {
                    resolve(res[0] || null);
                    promisePool.end();
                })
                .catch(err => {
                    reject(err);
                    promisePool.end();
                });
        });
    }

    //返回单个查询结果
    single(sql, params) {
        console.log(sql, params)
        const promisePool = this.dbClient.promise();
        return new Promise((resolve, reject) => {
            promisePool.query(sql, params)
                .then(res => {
                    for (let i in res[0]) {
                        resolve(res[0][i] || null);
                        promisePool.end();
                        return;
                    }
                    resolve(null);
                    promisePool.end();
                })
                .catch(err => {
                    reject(err);
                    promisePool.end();
                });
        });
    }

    //执行代码，返回执行结果
    query(sql, params) {
        const promisePool = this.dbClient.promise();
        return new Promise((resolve, reject) => {
            promisePool.query(sql, params)
                .then(res => {
                    resolve(res);
                    promisePool.end();
                })
                .catch(err => {
                    reject(err);
                    promisePool.end();
                });
        });
    }

    //执行代码，返回执行结果
    execute(sql, params) {
        const promisePool = this.dbClient.promise();
        return new Promise(async (resolve, reject) => {
            promisePool.execute(sql, params)
                .then(res => {
                    resolve(res);
                    promisePool.end();
                })
                .catch(err => {
                    reject(err);
                    promisePool.end();
                });
        })
    }

    escape(c) {
        return this.dbClient.escape(c);
    }
}

module.exports = MysqlDb;
