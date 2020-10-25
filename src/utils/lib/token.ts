import {Next, ParameterizedContext} from "koa";
import Db from './db';
import {isNull, restful} from './tool';
import {encodeMd5} from "./crypto";
import Logger from "./logger";

const Config = require('../cfg/config.json');

/**
 * 通过用户id添加token
 * @param id
 */
export async function tokenAdd(id: number) {
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
export async function tokenGet(token: string) {
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
export async function tokenTtl(token: string) {
    try {
        return await Db.redisDb["sub"].ttl(0, token) as number;
    } catch (e) {
        Logger.error(e);
        return -2;
    }
}

export async function tokenUse(ctx: ParameterizedContext, next: Next) {
    let url = ctx.request.url.split('?')[0];
    if (url === "/" || Config.noToken.indexOf(url) > -1 || url.indexOf('/public') > -1) {
        await next();
        return;
    }
    try {
        let token = ctx.request.headers['authorization'];
        if (isNull(token)) {
            ctx.body = restful.error('没有token');
            return;
        }
        let outTime = await tokenTtl(token);
        if (outTime <= 0) {
            ctx.body = restful.error('没有token，或已过期');
            return;
        } else if (outTime <= 1800) {
            ctx.set('Authorization', await tokenAdd(token));
        } else {
            ctx.set('Authorization', token);
        }
        ctx.userInfo= {id: Number(await tokenGet(token))};
        await next();
    } catch (err) {
        Logger.error(err);
        ctx.body = restful.error('服务器错误');
    }
}
