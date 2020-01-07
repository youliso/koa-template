const db = require('./mysqldb');
const crypto = require('./crypto');
const logger = require('./logger').logger;

class original {

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

    isNull(obj) {
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
        return this.db.single('select * from ? where id = ?', [table, id]);
    }

    _upd(table, data, id) {
        return this.db.query('update ? set ? where id = ?', [table, data, id])
    }

    _del(table, id) {
        return this.db.query('delete from ? where id = ?', [table, id]);
    }
}

module.exports = original;