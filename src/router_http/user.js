'use strict';
const Router = require('koa-router');
const _ = require('../utils/lib/original');
const user = new Router();
const User = require('../info/user');

user.get('/get', async (ctx, next) => {
    let us = new User();
    ctx.body = await us.get();
    await next();
});

user.post('/login', async (ctx, next) => {
    ctx.body = _.success('测试');
    await next();
});

user.post('/register', async (ctx, next) => {
    ctx.body = _.success('测试');
    await next();
});

module.exports = user;
