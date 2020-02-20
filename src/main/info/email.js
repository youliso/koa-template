const _ = require('../../resources/utils/original');
const eTemplate = require('../../resources/utils/eTemplate');
const nodeMailer = require('nodemailer');

/**
 * 发送邮件结构
 * email 收件人
 * */

class Email {
    constructor(info) {
        this.TABLE_NAME = 'verify_list';
        info = info || {};
        this.email = _.trim(info.email);
        this.code = Math.random().toString(16).slice(2, 6).toUpperCase();
        this.conf = {
            user: 'test@163.com',
            pass: 'test'
        };
        this.transportOptions = {
            service: '163', // no need to set host or port etc. 更多邮箱支持 https://nodemailer.com/smtp/well-known/
            auth: this.conf
        };
        let data = {
            tuser: this.email,
            code: this.code,
            title: 'test - 验证邮件'
        };
        this.sendMailOptions = {
            from: `test<${this.conf.user}>`, // 发件人
            to: this.email, // 收件人
            cc: this.conf.user,
            subject: 'test - 验证邮件', // 邮件主题
            html: new eTemplate(data).get() // 邮件内容
        };
    }

    async add() {
        let data = {email: this.email, code: this.code, endtime: new Date().getTime() + 10 * 60 * 1000};
        await _._add(this.TABLE_NAME, data);
    }

    async del(id) {
        await _._del(this.TABLE_NAME, id);
    }

    async get() {
        let req = await _.db.single('select * from ? where email=?', [this.TABLE_NAME, this.email]);
        if (req && Number(req.endtime) > new Date().getTime()) return req;
        else {
            if (req) await this.del(req.id);
            return null;
        }
    }

    async send() {
        try {
            this.sendMailOptions.subject = `test - 验证码`;
            let find = await this.get();
            if (find) return _.success('已发送,十分钟有效期');
            let transporter = nodeMailer.createTransport(this.transportOptions);
            let info = await transporter.sendMail(this.sendMailOptions);
            if (info) {
                await this.add();
                return _.success('发送成功,十分钟有效期');
            }
        } catch (err) {
            _.logger.error(err);
            return _.error('验证码发送失败，请重新尝试');
        }
    }

}

module.exports = Email;