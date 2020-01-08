'use strict';
const http = require('http');
const koa = require('koa');
const static_ = require('koa-static');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const cors = require('koa2-cors');
const WebSocket = require('ws');
// const https = require('https');
// const enforceHttps = require('koa-sslify').default;
const path = require('path');
const fs = require('fs');
const {httpToken} = require('./utils/token');
const app = new koa();
const router = new Router();

//Origin*
app.use(cors({
    allowHeaders: ['Content-Type', 'Authorization'], //设置服务器支持的所有头信息字段
    exposeHeaders: ['Content-Type', 'Authorization'] //设置获取其他自定义字段
}));

// utils
app.use(async (ctx, next) => {
    if (ctx.path === '/favicon.ico') return;
    ctx.logger = require('./utils/logger').logger;
    let original = require('./utils/original');
    ctx.result = new original();
    await next();
});

// https
// app.use(enforceHttps());

//logger
// app.use(require('../resources/utils/logger').accessLogger());

// bodyParser
app.use(bodyParser);

//token
app.use(httpToken);

// static
app.use(static_(
    path.join(__dirname, '../resources/static')
));

// router
fs.readdirSync(__dirname + '/router').forEach((element) => {
    let module = require(__dirname + '/router/' + element);
    router.use('/' + element.replace('.js', ''), module.routes(), module.allowedMethods());
});

app.use(router.routes());

app.use(async (ctx, next) => {
    await next();
    if (ctx.request.path === '/') ctx.body = "Copyright (c) 2019 youliso";
    if (parseInt(ctx.status) === 404) ctx.body = ctx.result.error('无效请求');
});

//error
app.on('error', (err, ctx) => {
    ctx.logger.error(err);
});

// router - ws
let wsRouter = {};
fs.readdirSync(__dirname + '/ws').forEach((element) => {
    wsRouter[element.replace('.js', '')] = require(__dirname + '/ws/' + element);
});
const WebSocketApi = require('./utils/ws');//引入封装的ws模块
const server = http.createServer(app.callback());
const ws = new WebSocket.Server({// 同一个端口监听不同的服务
    server
});

new WebSocketApi().init(ws, wsRouter);
server.listen(3000);

// https.createServer({
//     key: fs.readFileSync('./src/resources/certificate/server.key'),
//     cert: fs.readFileSync('./src/resources/certificate/server.pem')
// }, app.callback()).listen(443);

