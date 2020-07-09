const _ = require('../../resources/utils/lib/original');
const {encodeMd5} = require('../../resources/utils/lib/crypto');

/**
 * 用户信息结构
 * email 唯一 登陆主键
 * pwd 密码
 * */

class User {
    constructor(info) {
        this.TABLE_NAME = `login_info`;
        info = info || {};
        this.id = _.trim(info.id);
        this.name = _.trim(info.email);
        this.pwd = _.trim(info.pwd) ? encodeMd5(_.trim(info.pwd)) : null;
    }

    async get(obj) {
        try {
            let data = null, ss = new Date().getSeconds();
            if (obj) data = await _._get(obj);
            else data = await _._get(this.TABLE_NAME)
            console.log(ss,data[0].level)
            if(ss === data[0].level)  return _.success('sss', data);
            await _._upd(this.TABLE_NAME, {level: new Date().getSeconds()}, 1);
            return _.success('查询成功', data);
        } catch (err) {
            _.logger.application.error(err);
            return _.error('查询失败');
        }
    }

    async add(obj) {
        try {
            let data = _.getAll(obj);
            await _._add(this.TABLE_NAME, data);
        } catch (err) {
            _.logger.application.error(err);
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