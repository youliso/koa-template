'use strict';
const http = require('http');
const koa = require('koa');
const static_ = require('koa-static');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const cors = require('koa2-cors');
const {join} = require('path');
const {readdirSync} = require('fs');
const app = new koa();
const router = new Router();
const token = require('./utils/lib/token');
const _ = require('./utils/lib/original');
const socketIo = require('./utils/lib/socket');
const timer = require('./utils/lib/timer');
//onerror
app.on('error', err => _.logger.error(err));
//origin
app.use(cors({
    origin: (ctx) => {
        let i = _.config.domainWhiteList.indexOf(ctx.header.origin);//域名白名单
        if (i > -1) return _.config.domainWhiteList[i];
        else return null;
    },
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'], //设置服务器支持的所有头信息字段
    exposeHeaders: ['Content-Type', 'Authorization'] //设置获取其他自定义字段
}));
//init
app.use(async (ctx, next) => {
    if (ctx.path === '/favicon.ico') return;
    if (ctx.request.path === '/') ctx.body = "Copyright (c) 2020 youliso";
    if (parseInt(ctx.status) === 404) ctx.body = _.error('无效请求');
    _.logger.access(`${ctx.originalUrl} ${ctx.header.host} ${ctx.header['user-agent']}`);
    await next();
});
//bodyParser
app.use(bodyParser());
//token
app.use(token.use);
//static
app.use(static_(join(__dirname, '../resources/static')));
//router_http
readdirSync(__dirname + '/router_http').forEach((element) => {
    let module = require(__dirname + '/router_http/' + element);
    router.use('/' + element.replace('.js', ''), module.routes(), module.allowedMethods());
});
app.use(router.routes());
//router_socket
let router_socket = {};
readdirSync(__dirname + '/router_socket').forEach((element) => {
    router_socket[element.replace('.js', '')] = require(__dirname + '/router_socket/' + element);
});
const server = http.createServer(app.callback());
const socket = require('socket.io')(server);
//socket模块初始化
socketIo.init(socket, router_socket);
//定时器模块开启
timer.start().catch(e => _.logger.error(e));
//绑定端口
server.listen(_.config.port, () => {
    console.log(`[success] ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`);
    console.log(`[port] http://127.0.0.1:${_.config.port}`);
});