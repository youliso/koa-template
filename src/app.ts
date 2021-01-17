import * as http from 'http';
import {join} from 'path';
import * as Koa from 'koa';
import * as Static from 'koa-static';
import * as BodyParser from 'koa-bodyparser';
import * as Cors from 'koa2-cors';
import {tokenUse} from './lib/token';
import Log from './lib/log';
import {socketServer} from './lib/socket_server';
import Timer from './lib/timer';
import Router from './router';

const Config = require('./config/config.json');
const koa = new Koa();

class App {
    constructor() {
    }

    async init() {
        //onerror
        koa.on('error', err => Log.error(err));
        //init
        koa.use(async (ctx, next) => {
            if (ctx.request.path === "/favicon.ico") return;
            await next();
            if (ctx.request.path === "/") ctx.body = "Copyright (c) 2020 youliso";
            Log.access(`${ctx.originalUrl} ${ctx.header["x-real-ip"] || "-"} ${ctx.header["user-agent"]}`);
        });
        //origin
        let origin: string = null;
        koa.use(Cors({
            origin: (ctx: Koa.ParameterizedContext) => {
                let i = Config.domainWhiteList.indexOf(ctx.header.origin);//域名白名单
                origin = Config.domainWhiteList[i];
                return Config.domainWhiteList[i];
            },
            ...Config.cors
        }));
        //bodyParser
        koa.use(BodyParser());
        //token
        koa.use(tokenUse);
        //static
        koa.use(Static(join(__dirname, '../resources/static')));
        koa.use(await Router.http())
        const server = http.createServer(koa.callback());
        //socket模块初始化
        socketServer.init(server, origin, await Router.socket());
        //定时器模块开启
        await Timer.start();
        //绑定端口
        server.listen(Config.port, () => {
            console.log(`[success] ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`);
            console.log(`[port] http://127.0.0.1:${Config.port}`);
        });
    }
}

new App().init().catch(e => Log.error(e));
