'use strict';
const Router = require('koa-router');
const test = new Router();
test.get('/i', async (ctx, next) => {
    ctx.body = JSON.stringify(ctx.result.success('test'));
    await next();
});

module.exports = test;
