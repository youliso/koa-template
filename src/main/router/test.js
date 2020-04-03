'use strict';
const _ = require('../../resources/utils/original');
const Router = require('koa-router');
const test = new Router();
let va = 0;
test.get('/i', async (ctx, next) => {
    ctx.body = await _.lock.acquire('user_add', async () => {
        console.log('start');
    }).then(() => {
        return _.success('注册成功');
    });
    await next();
});

module.exports = test;
