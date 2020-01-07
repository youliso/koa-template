const original = require('../utils/original');
const {encodeMd5} = require('../utils/crypto');
const db = require('../utils/mysqldb');

/**
 * 用户信息结构
 * email 唯一 登陆主键
 * pwd 密码
 * */

class User extends original {
    constructor(info) {
        super();
        this.TABLE_NAME = 'user_info';
        info = info || {};
        this.id = this.trim(info.id);
        this.email = this.trim(info.email);
        this.pwd = this.trim(info.pwd) ? encodeMd5(this.trim(info.pwd)) : null;
    }

    async add(obj) {
        let data = this.getAll(obj);
        await this._add(this.TABLE_NAME, data);
        return this.success('注册成功');
    }

    async upd(obj) {
        let data = this.getAll(obj);
        await this._upd(this.TABLE_NAME, data, this.id);
        return db.query('update user_info set ? where id = ?', data)
    }
}

module.exports = User;