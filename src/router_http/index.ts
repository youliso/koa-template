import * as Router from 'koa-router';
import {restful} from '../utils/lib/tool';

const index = new Router();

index.get('/get', async (ctx, next) => {
    ctx.body = restful.success('测试');
    await next();
});

export default index;
