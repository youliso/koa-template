import {Next, ParameterizedContext} from "koa";
import Db from './db';
import {isNull, restful} from './tool';
import {encodeMd5} from "./crypto";
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
        try {
            let token = ctx.request.headers['authorization'];
            if (isNull(token)) {
                ctx.body = restful.error('没有token');
                await next();
                return;
            }
            let outTime = await this.ttl(token);
            if (outTime <= 0) {
                ctx.body = restful.error('没有token，或已过期');
                await next();
                return;
            } else if (outTime <= 1800) {
                ctx.set('Authorization', await this.add(token));
            }
            let id = await this.get(token);
            if (isNull(id)) {
                ctx.body = restful.error('没有token，或已过期');
                await next();
                return;
            }
            ctx.userInfo = {id: Number(id)};
        } catch (err) {
            Logger.error(err);
            ctx.body = restful.error('服务器错误');
        }
    }

    /**
     * 通过用户id添加token
     * @param id
     */
    async add(id: number) {
        try {
            let token = encodeMd5(id.toString());
            await Db.redisDb["sub"].set(0, token, id.toString(), 7200);
            return token;
        } catch (e) {
            Logger.error(e);
            return null;
        }
    }

    /**
     * 查询token
     * @param token
     */
    async get(token: string) {
        try {
            return await Db.redisDb["sub"].get(0, token);
        } catch (e) {
            Logger.error(e);
            return null;
        }
    }

    /**
     * 查询token是否过期
     * @param token
     */
    async ttl(token: string) {
        try {
            return await Db.redisDb["sub"].ttl(0, token) as number;
        } catch (e) {
            Logger.error(e);
            return -2;
        }
    }
}

export default Token.getInstance();
