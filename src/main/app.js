'use strict';
const http = require('http');
const koa = require('koa');
const static_ = require('koa-static');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const cors = require('koa2-cors');
const path = require('path');
const fs = require('fs');
const app = new koa();
const router = new Router();
const {httpToken} = require('../resources/utils/token');
const _ = require('../resources/utils/original');
const wsIo = require('../resources/utils/ws');
const timer = require('../resources/utils/timer');
const port = 3000;
//Origin*
app.use(cors({
    allowHeaders: ['Content-Type', 'Authorization'], //设置服务器支持的所有头信息字段
    exposeHeaders: ['Content-Type', 'Authorization'] //设置获取其他自定义字段
}));
// favicon
app.use(async (ctx, next) => {
    if (ctx.path === '/favicon.ico') return;
    await next();
});
//logger
app.use(_.logger.accessLogger);
//error
app.on('error', err => _.logger.application.error(err));
// bodyParser
app.use(bodyParser());
//token
app.use(httpToken);
// static
app.use(static_(path.join(__dirname, '../resources/static')));
// router
fs.readdirSync(__dirname + '/router').forEach((element) => {
    let module = require(__dirname + '/router/' + element);
    router.use('/' + element.replace('.js', ''), module.routes(), module.allowedMethods());
});
app.use(router.routes());
app.use(async (ctx, next) => {
    await next();
    if (ctx.request.path === '/') ctx.body = "Copyright (c) 2019 youliso";
    if (parseInt(ctx.status) === 404) ctx.body = _.error('无效请求');
});
// router - ws
let wsRouter = {};
fs.readdirSync(__dirname + '/ws').forEach((element) => {
    wsRouter[element.replace('.js', '')] = require(__dirname + '/ws/' + element);
});
const server = http.createServer(app.callback());
wsIo.init(server, wsRouter); //scoket模块
timer.start();//定时器模块
server.listen(port, () => console.log(`app run at : http://127.0.0.1:${port}`))