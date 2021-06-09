import { Next, ParameterizedContext } from 'koa';
import Db from '@/common/db';
import { isNull } from '@/lib';
import { encodeMd5, randomSize } from '@/lib/crypto';
import Log from '@/lib/log';

/**
 * 通过用户id添加token
 * @param id
 */
export async function tokenAdd(id: number) {
  try {
    let token = encodeMd5(id.toString() + randomSize(10));
    await Db.redisDb['sub'].set(0, token, id.toString(), 7200);
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
    return await Db.redisDb['sub'].get(0, token);
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
    return (await Db.redisDb['sub'].ttl(0, token)) as number;
  } catch (e) {
    Log.error(e);
    return -2;
  }
}

/**
 * 更新token剩余时间
 * @param token
 * @param seconds
 */
export async function tokenExpire(token: string, seconds: number) {
  try {
    return (await Db.redisDb['sub'].expire(0, token, seconds)) as number;
  } catch (e) {
    Log.error(e);
    return -2;
  }
}

export async function tokenUse(ctx: ParameterizedContext, next: Next) {
  let token = ctx.request.headers['authorization'];
  if (isNull(token)) {
    ctx.body = '没有token';
    return;
  }
  let outTime = await tokenTtl(token);
  if (outTime <= 0) {
    ctx.body = '没有token，或已过期';
    return;
  } else {
    if (outTime <= 1800) await tokenExpire(token, 7200);
    ctx.set('Authorization', token);
  }
  ctx.userInfo = { id: Number(await tokenGet(token)) };
  await next();
}
