import Router from 'koa-router';
import *as restful from '../lib/restful';

const index = new Router();

index.get('/get', async (ctx, next) => {
    ctx.body = restful.success('测试');
    await next();
});

export default index;
