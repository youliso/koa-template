'use strict';
const Router = require('koa-router');
const test = new Router();
let va = 0;
test.get('/i', async (ctx, next) => {
    ctx.body = ctx.result.success(va++);
    await next();
});

module.exports = test;
