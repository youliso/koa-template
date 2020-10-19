import {Next, ParameterizedContext} from "koa";
import Db from './db';
import {restful} from './tool';
import {decodeAse, tokenAes} from "./crypto";
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
                let payload = decodeAse(token);
                let {id, time} = JSON.parse(payload);
                let find = await Db.get('user_info', id);
                if (find) {
                    let data = new Date().getTime();
                    if (data <= time) {
                        delete find['pwd'];
                        ctx.userInfo = {...<object>find};
                        ctx.set('Authorization', tokenAes(find['id']));
                        await next();
                    } else ctx.body = restful.error('token已过期');
                } else ctx.body = restful.error('不存在此token');
            } catch (err) {
                Logger.error(err);
                ctx.body = restful.error('服务器错误');
            }
        } else ctx.body = restful.error('无效请求');
    }
}

export default Token.getInstance();
