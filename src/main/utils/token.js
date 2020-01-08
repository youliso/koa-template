'use strict';
const original = require('./original');
const _ = new original();
module.exports = {
    httpToken: async (ctx, next) => {
        let url = ctx.request.url;
        if (ctx.config.noToken.indexOf(url) > -1 || url.indexOf('/dist') > -1) await next();
        else {
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
                            ctx.userInfo = find;
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
    },
    wsToken: async (client, token) => {
        if (token) {
            try {
                let payload = _.crypto.decodeAse(token);
                let {id, time} = JSON.parse(payload);
                let find = await _._get('user_info', id);
                if (find) {
                    let data = new Date().getTime();
                    if (data <= time) {
                        delete find.pwd;
                        return {userInfo: find, token: _.crypto.token(find.id)}
                    } else client.send(_.WsError('token已过期'));
                } else client.send(_.WsError('不存在此token'));
            } catch (err) {
                _.logger.error(err);
                client.send(_.WsError('token无效'));
            }
        } else client.send(_.WsError('token无效'));
    }
};