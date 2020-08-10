const _ = require('../utils/lib/original');
const eTemplate = require('../utils/eTemplate');
const nodeMailer = require('nodemailer');

/**
 * 发送邮件结构
 * email 收件人
 * */

class email {
    constructor(info) {
        info = info || {};
        this.title = info.title;
        this.email = info.email;
        this.code = Math.random().toString(16).slice(2, 6).toUpperCase();
        this.out_time = 60 * 10;
        this.conf = {
            user: 'test@163.com',
            pass: 'test'
        };
        this.transportOptions = {
            service: '163', // no need to set host or port etc. 更多邮箱支持 https://nodemailer.com/smtp/well-known/
            auth: this.conf
        };
        this.sendMailOptions = {
            from: `${this.title}<${this.conf.user}>`, // 发件人
            to: this.email, // 收件人
            cc: this.conf.user,
            subject: info.subject // 邮件主题
        };
    }

    async add(key) {
        try {
            return await _.db.vice1.set(0, key, this.code, this.out_time);
        } catch (err) {
            _.logger.error(err);
            return null;
        }
    }

    async del(key) {
        try {
            return await _.db.vice1.del(0, key);
        } catch (err) {
            _.logger.error(err);
            return null;
        }
    }

    async get(key) {
        try {
            return await _.db.vice1.get(0, key);
        } catch (err) {
            _.logger.error(err);
            return null;
        }
    }

    //注册邮件
    async register() {
        try {
            let find = await this.get(`${this.email}-register-code`);
            if (find) return _.success('已发送,十分钟有效期');
            let transporter = nodeMailer.createTransport(this.transportOptions);
            this.sendMailOptions.html = new eTemplate({
                email: this.email,
                code: this.code,
                title: this.title
            }).register();
            let info = await transporter.sendMail(this.sendMailOptions);
            if (info) {
                await this.add(`${this.email}-register-code`);
                return _.success('发送成功,十分钟有效期');
            }
        } catch (err) {
            _.logger.error(err);
            return _.error('发送失败，请重新尝试');
        }
    }

}

module.exports = email;