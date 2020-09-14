import * as Router from 'koa-router';
import _ from '../utils/lib/tool';

const index = new Router();

index.get('/get', async (ctx, next) => {
    ctx.body = _.success('测试');
    await next();
});

export default index;
