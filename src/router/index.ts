import Koa from 'koa';
import Router from 'koa-router';
import { controllers } from '@/common/decorators/http';
import { sockets } from '@/common/decorators/socket';
import { socketServer } from '@/lib/socket';
export * from './modular'; //载入模块

const router = new Router();
/**
 * 初始化路由
 */
export default async (app: Partial<Koa.DefaultState & Koa.DefaultContext>) => {
  controllers.forEach((item) => {
    // 获取每个路由的前缀
    const prefix = item.constructor.prefix;
    let url = item.url;
    if (prefix) url = `${prefix}${url}`; // 组合真正链接
    console.log('[modular|http]', url);
    router[item.method](url, ...item.middleware, item.handler); // 创建路由
  });
  let socketRouters: { [key: string]: Function[] } = {};
  sockets.forEach((item) => {
    // 获取每个路由的前缀
    const prefix = item.constructor.prefix;
    let url = item.url;
    if (prefix) url = `${prefix}${url}`; // 组合真正链接
    console.log('[modular|socket]', url);
    socketRouters[`${prefix}${url}`] = [...item.middleware, item.handler];
  });
  socketServer.start(socketRouters);
  app.use(router.routes()).use(router.allowedMethods()); // 路由装箱
};
