import {Next, ParameterizedContext} from "koa";
import _ from './original';
import Crypto from "./crypto";
import Logger from "./logger";

const Config = require('../cfg/config.json');

class Token {
    private static instance: Token;

    static getInstance() {
        if (!Token.instance) Token.instance = new Token();
        return Token.instance;
    }

    constructor() {
    }

    async use(ctx: ParameterizedContext, next: Next) {
        let url = ctx.request.url.split('?')[0];
        if (url === "/" || Config.noToken.indexOf(url) > -1 || url.indexOf('/public') > -1) {
            await next();
            return;
        }
        let token = ctx.request.headers['authorization'];
        if (token) {
            try {
                let payload = Crypto.decodeAse(token);
                let {id, time} = JSON.parse(payload);
                let find = await _._get('user_info', id);
                if (find) {
                    let data = new Date().getTime();
                    if (data <= time) {
                        delete find.pwd;
                        ctx.userInfo = {...find};
                        ctx.set('Authorization', Crypto.token(find.id));
                        await next();
                    } else ctx.body = _.error('token已过期');
                } else ctx.body = _.error('不存在此token');
            } catch (err) {
                Logger.error(err);
                ctx.body = _.error('服务器错误');
            }
        } else ctx.body = _.error('无效请求');
    }
}

export default Token.getInstance();
