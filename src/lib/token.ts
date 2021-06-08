import { Next, ParameterizedContext } from 'koa';
import { isNull } from './';
import { encodeMd5, randomSize } from './crypto';
import Log from './log';

const Config = require('../config/config.json');

let Tokens: { [key: string]: { time: number; id: number } } = {};//TODO

/**
 * 通过用户id添加token
 * @param id
 */
export async function tokenAdd(id: number, time: number = 7200) {
  try {
    let token = encodeMd5(id.toString() + randomSize(10));
    Tokens[token] = { id, time };
    return token;
  } catch (e) {
    Log.error(e);
    return null;
  }
}

/**
 * 查询token
 * @param token
 */
export async function tokenGet(token: string) {
  try {
    return Tokens[token];
  } catch (e) {
    Log.error(e);
    return null;
  }
}

/**
 * 查询token是否过期
 * @param token
 */
export async function tokenTtl(token: string) {
  try {
    return Tokens[token].time;
  } catch (e) {
    Log.error(e);
    return -2;
  }
}

export async function tokenUse(ctx: ParameterizedContext, next: Next) {
  try {
    let token = ctx.request.headers['authorization'];
    if (isNull(token)) {
      ctx.body = '没有token';
      return;
    }
    let outTime = await tokenTtl(token);
    if (outTime <= 0) {
      ctx.body = '没有token，或已过期';
      return;
    }
    ctx.set('Authorization', token);
    ctx.userInfo = { id: Number(await tokenGet(token)) };
    await next();
  } catch (err) {
    Log.error(err);
    ctx.body = '服务器错误';
  }
}
