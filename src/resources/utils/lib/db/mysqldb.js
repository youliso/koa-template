'use strict';
const mysql = require('mysql2');

class MysqlDb {

    static getInstance() {
        if (!MysqlDb.instance) MysqlDb.instance = new MysqlDb();
        return MysqlDb.instance;
    }

    constructor() {
        this.dbClient = '';
    }

    connect(db) {  /*连接数据库*/
        if (!this.dbClient) {
            this.dbClient = mysql.createPool(db);
            console.log(`[mysql] ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`);
        }
    }

    //将结果已对象数组返回
    row(sql, params) {
        const promisePool = this.dbClient.promise();
        return new Promise((resolve, reject) => {
            promisePool.query(sql, params)
                .then(res => resolve(res))
                .catch(err => reject(err));
        });
    }

    //返回一个对象
    first(sql, params) {
        const promisePool = this.dbClient.promise();
        return new Promise((resolve, reject) => {
            promisePool.query(sql, params)
                .then(res => resolve(res[0] || null))
                .catch(err => reject(err));
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
                        return;
                    }
                    resolve(null);
                })
                .catch(err => reject(err));
        });
    }

    //执行代码，返回执行结果
    query(sql, params) {
        const promisePool = this.dbClient.promise();
        return new Promise((resolve, reject) => {
            promisePool.query(sql, params)
                .then(res => resolve(res))
                .catch(err => reject(err));
        });
    }

    //执行代码，返回执行结果
    execute(sql, params) {
        const promisePool = this.dbClient.promise();
        return new Promise(async (resolve, reject) => {
            promisePool.execute(sql, params)
                .then(res => resolve(res))
                .catch(err => reject(err));
        })
    }

    escape(c) {
        return this.dbClient.escape(c);
    }
}

module.exports = MysqlDb.getInstance();