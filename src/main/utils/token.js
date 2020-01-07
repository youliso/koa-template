'use strict';
const original = require('./original');

class token extends original {

    constructor() {
        super();
    }

    async httpToken(ctx, next) {
        let url = ctx.request.url;
        if (ctx.config.noToken.indexOf(url) > -1 || url.indexOf('/dist') > -1) await next();
        else {
            let token = ctx.request.headers['authorization'];
            if (token) {
                try {
                    let payload = this.crypto.decodeAse(token);
                    let {id, time} = JSON.parse(payload);
                    let find = await this._get('user_info', id);
                    if (find) {
                        let data = new Date().getTime();
                        if (data <= time) {
                            delete find.pwd;
                            ctx.userInfo = find;
                            ctx.set('Authorization', this.crypto.token(find.id));
                            await next();
                        } else ctx.body = this.error('token已过期');
                    } else ctx.body = this.error('不存在此token');
                } catch (err) {
                    this.logger.error(err);
                    ctx.body = this.error('token无效');
                }
            } else ctx.body = this.error('token无效');
        }
    }

    async wsToken(client, token) {
        if (token) {
            try {
                let payload = this.crypto.decodeAse(token);
                let {id, time} = JSON.parse(payload);
                let find = await this._get('user_info', id);
                if (find) {
                    let data = new Date().getTime();
                    if (data <= time) {
                        delete find.pwd;
                        return {userInfo: find, token: this.crypto.token(find.id)}
                    } else client.send(this.WsError('token已过期'));
                } else client.send(this.WsError('不存在此token'));
            } catch (err) {
                this.logger.error(err);
                client.send(this.WsError('token无效'));
            }
        } else client.send(this.WsError('token无效'));
    }
}

let e = new token();
module.exports = {
    httpToken: e.httpToken,
    wsToken: e.wsToken
};