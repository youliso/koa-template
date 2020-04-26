'use strict';
const net = require('net');
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
const io = require('../resources/utils/socket');
const timer = require('../resources/utils/timer');
const host='127.0.0.1';
const port_http= 3000;
const port_socket= 3001;
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
//router_http
fs.readdirSync(__dirname + '/router_http').forEach((element) => {
    let module = require(__dirname + '/router_http/' + element);
    router.use('/' + element.replace('.js', ''), module.routes(), module.allowedMethods());
});
app.use(router.routes());
app.use(async (ctx, next) => {
    await next();
    if (ctx.request.path === '/') ctx.body = "Copyright (c) 2019 youliso";
    if (parseInt(ctx.status) === 404) ctx.body = _.error('无效请求');
});
let router_socket = {};
fs.readdirSync(__dirname + '/router_socket').forEach((element) => {
    router_socket[element.replace('.js', '')] = require(__dirname + '/router_socket/' + element);
});
const app_http = http.createServer(app.callback());
const app_socket = new net.createServer();
io.init(app_socket, router_socket); //socket模块
timer.start().then();//定时器模块
app_http.listen(port_http,host,() => console.log(`app_http http://${host}:${port_http}`));
app_socket.listen( port_socket,host, () => console.log(`app_socket：http://${host}:${port_socket}`));