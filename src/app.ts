import * as http from 'http';
import {readdirSync} from 'fs';
import {join} from 'path';
import * as Koa from 'koa';
import * as Static from 'koa-static';
import * as Router from 'koa-router';
import * as BodyParser from 'koa-bodyparser';
import * as Cors from 'koa2-cors';
import * as SocketIo from 'socket.io';

import _ from './utils/lib/original';
import Socket from './utils/lib/socket';
import Timer from './utils/lib/timer';
const app = new Koa();
const router = new Router();

//onerror
app.on('error', err => _.logger.error(err));

//origin
app.use(Cors({
    origin: (ctx: Koa.ParameterizedContext) => {
        let i = _.config.domainWhiteList.indexOf(ctx.header.origin);//域名白名单
        if (i === -1 || ctx.path === '/favicon.ico') ctx.throw(400, '无效访问');
        return _.config.domainWhiteList[i] || null;
    },
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'], //设置服务器支持的所有头信息字段
    exposeHeaders: ['Content-Type', 'Authorization'] //设置获取其他自定义字段
}));

//bodyParser
app.use(BodyParser());

//token
app.use(_.token);

//static
app.use(Static(join(__dirname, '../resources/static')));

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
//socket模块初始化
new Socket().init(SocketIo(server), router_socket);
//定时器模块开启
Timer.start().catch(e => _.logger.error(e));
//绑定端口
server.listen(_.config.port, () => {
    console.log(`[success] ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`);
    console.log(`[port] http://127.0.0.1:${_.config.port}`);
});
