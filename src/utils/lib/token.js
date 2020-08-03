'use strict';
const {noToken} = require('../../../resources/cfg/config.json');
const _ = require('./original');

class token {

    static getInstance() {
        if (!token.instance) token.instance = new token();
        return token.instance;
    }

    constructor() {
    }

    async use(ctx, next) {
        let url = ctx.request.url.split('?')[0];
        if (url === "/" || noToken.indexOf(url) > -1 || url.indexOf('/public') > -1) {
            await next();
            return;
        }
        let token = ctx.request.headers['authorization'];
        if (token) {
            try {
                let payload = _.crypto.decodeAse(token);
                let {id, time} = JSON.parse(payload);
                let find = await _._get('user_info', id);
                if (find) {
                    let data = new Date().getTime();
                    if (data <= time) {
                        delete find.pwd;
                        ctx.userInfo = {...find};
                        ctx.set('Authorization', _.crypto.token(find.id));
                        await next();
                    } else ctx.body = _.error('token已过期');
                } else ctx.body = _.error('不存在此token');
            } catch (err) {
                _.logger.error(err);
                ctx.body = _.error('token无效');
            }
        } else ctx.body = _.error('token无效');
    }
}

module.exports = token.getInstance();
