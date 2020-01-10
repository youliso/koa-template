const _ = require('../utils/original');
const {encodeMd5} = require('../utils/crypto');

/**
 * 用户信息结构
 * email 唯一 登陆主键
 * pwd 密码
 * */

class User {
    constructor(info) {
        this.TABLE_NAME = 'user_info';
        info = info || {};
        this.id = _.trim(info.id);
        this.email = _.trim(info.email);
        this.pwd = _.trim(info.pwd) ? encodeMd5(_.trim(info.pwd)) : null;
    }

    async add(obj) {
        try {
            let data = _.getAll(obj);
            await _._add(this.TABLE_NAME, data);
            return _.success('注册成功');
        } catch (err) {
            _.logger.error(err);
            return _.error('注册失败');
        }
    }

    async upd(obj) {
        try {
            let data = _.getAll(obj);
            await _._upd(this.TABLE_NAME, data, this.id);
            return _.success('修改成功');
        } catch (err) {
            _.logger.error(err);
            return _.error('修改失败');
        }
    }
}

module.exports = User;