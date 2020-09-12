import * as http from 'http';
import {join} from 'path';
import * as Koa from 'koa';
import * as Static from 'koa-static';
import * as BodyParser from 'koa-bodyparser';
import * as Cors from 'koa2-cors';
import * as SocketIo from 'socket.io';
import _ from './utils/lib/original';
import Logger from './utils/lib/logger';
import Socket from './utils/lib/socket';
import Timer from './utils/lib/timer';
import Router from './router';

const Config = require('./utils/cfg/config.json');
const koa = new Koa();

class App {
    constructor() {
    }

    async init() {
        //onerror
        koa.on('error', err => Logger.error(err));
        //init
        koa.use(async (ctx, next) => {
            if (ctx.request.path === '/favicon.ico') return;
            await next();
            if (ctx.request.path === '/') ctx.body = _.success('Copyright (c) 2020 youliso');
            Logger.access(`${ctx.originalUrl} ${ctx.header['x-real-ip']} ${ctx.header['user-agent']}`);
        });
        //origin
        koa.use(Cors({
            origin: (ctx: Koa.ParameterizedContext) => {
                let i = Config.domainWhiteList.indexOf(ctx.header.origin);//域名白名单
                return Config.domainWhiteList[i];
            },
            allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowHeaders: ['Content-Type', 'Authorization'], //设置服务器支持的所有头信息字段
            exposeHeaders: ['Content-Type', 'Authorization'] //设置获取其他自定义字段
        }));
        //bodyParser
        koa.use(BodyParser());
        //token
        koa.use(_.token);
        //static
        koa.use(Static(join(__dirname, '../resources/static')));
        koa.use(await Router.http())
        const server = http.createServer(koa.callback());
        //socket模块初始化
        new Socket().init(SocketIo(server), Router.socket());
        //定时器模块开启
        Timer.start().catch(e => Logger.error(e));
        //绑定端口
        server.listen(Config.port, () => {
            console.log(`[success] ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`);
            console.log(`[port] http://127.0.0.1:${Config.port}`);
        });
    }
}

new App().init().catch(e => Logger.error(e));
