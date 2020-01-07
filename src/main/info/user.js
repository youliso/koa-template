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
        try {
            let data = this.getAll(obj);
            await this._add(this.TABLE_NAME, data);
            return this.success('注册成功');
        } catch (err) {
            this.logger.error(err);
            return this.error('注册失败');
        }
    }

    async upd(obj) {
        try {
            let data = this.getAll(obj);
            await this._upd(this.TABLE_NAME, data, this.id);
            return this.success('修改成功');
        } catch (err) {
            this.logger.error(err);
            return this.error('修改失败');
        }
    }
}

module.exports = User;