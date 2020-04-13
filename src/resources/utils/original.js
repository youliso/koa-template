const db = require('./mysqldb');
const crypto = require('./crypto');
const logger = require('./logger');

class original {

    static getInstance() {
        if (!original.instance) original.instance = new original();
        return original.instance;
    }

    constructor() {
        this.crypto = crypto;
        this.logger = logger;
        this.db = db;
    }

    trim(str) {
        if (!str) return null;
        str = str.toString();
        let obj = str.replace(/^\s*|\s*$/g, "");
        return obj === '' ? null : /^[0-9]+.?[0-9]*$/.test(obj) ? Number(obj) : obj;
    }

    isNull(arg) {
        if (typeof arg === 'string') arg = this.trim(arg);
        return !arg && arg !== 0 && typeof arg !== "boolean" ? true : false;
    }

    isNullAll(obj) {
        obj = obj || [];
        for (let i of obj) if (this[i]) return true;
        return false;
    }

    getAll(obj) {
        obj = obj || [];
        let data = {};
        for (let i of obj) if (this[i]) data[i] = this[i];
        return data;
    }

    success(msg, data) {
        return {code: 0, msg, data, time: new Date().getTime()};
    }

    error(msg, data) {
        return {code: -1, msg, data, time: new Date().getTime()};
    }

    WsSuccess(msg, result, data) {
        return JSON.stringify({code: 0, msg, result, data, time: new Date().getTime()});
    }

    WsError(msg, result, data) {
        return JSON.stringify({code: -1, msg, result, data, time: new Date().getTime()});
    }

    _add(table, data) {
        return this.db.query('insert into ? set ?', [table, data]);
    }

    _get(table, id) {
        if (id) return this.db.single('select * from ' + table + ' where id = ?', [id]);
        else return this.db.first('select * from ' + table);
    }

    _upd(table, data, id) {
        return this.db.query('update ' + table + ' set ? where id = ?', [data, id])
    }

    _del(table, id) {
        return this.db.query('delete from ' + table + ' where id = ?', [id]);
    }
}

module.exports = original.getInstance();