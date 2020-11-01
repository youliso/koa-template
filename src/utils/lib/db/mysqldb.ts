import * as mysql from 'mysql2/promise';
import Logger from "../logger";

export class MysqlDb {
    dbClient: mysql.Pool;

    constructor(db: object) {
        this.dbClient = mysql.createPool(db);
    }

    //返回一个对象
    async first(sql: string, params?: object) {
        try {
            const connection = await this.dbClient.getConnection();
            await connection.ping();
            const rows = await connection.query(sql, params);
            connection.release();
            return rows[0];
        } catch (e) {
            Logger.error(e.toString());
            return null;
        }
    }

    //返回单个查询结果
    async single(sql: string, params?: object) {
        try {
            const connection = await this.dbClient.getConnection();
            await connection.ping();
            const rows = await connection.query(sql, params);
            connection.release();
            return rows[0][Object.keys(rows[0])[0]];
        } catch (e) {
            Logger.error(e.toString());
            return null;
        }
    }

    //执行代码，返回执行结果
    async query(sql: string, params?: object) {
        try {
            const connection = await this.dbClient.getConnection();
            await connection.ping();
            const rows = await connection.query(sql, params);
            connection.release();
            return rows;
        } catch (e) {
            Logger.error(e.toString());
            return null;
        }
    }

    //执行代码，返回执行结果
    async execute(sql: string, params?: object) {
        try {
            const connection = await this.dbClient.getConnection();
            await connection.ping();
            const rows = await connection.execute(sql, params);
            connection.release();
            return rows;
        } catch (e) {
            Logger.error(e.toString());
            return null;
        }
    }

    /**
     * 防止注入
     * @param {*} c
     **/
    escape(c: unknown) {
        return mysql.escape(c);
    }

}
