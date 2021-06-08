import http from 'http';
import { join } from 'path';
import Koa from 'koa';
import Cors from 'koa2-cors';
import Static from 'koa-static';
import Compress from 'koa-compress';
import Bodyparser from 'koa-bodyparser';
import Router from '@/router';
import { socketServer } from '@/lib/socket';
import Log from '@/lib/log';
import Timer from '@//lib/timer';

const Config = require('@/cfg/index.json');
const koa = new Koa();

(async () => {
  const server = http.createServer(koa.callback());

  //onerror
  koa.on('error', (err) => Log.error(err));

  //init
  koa.use(async (ctx, next) => {
    if (ctx.request.path === '/favicon.ico') return;
    await next();
    if (ctx.request.path === '/') ctx.body = 'Copyright (c) 2021 youliso';
    Log.access(`${ctx.originalUrl} ${ctx.header['x-real-ip'] || '-'} ${ctx.header['user-agent']}`);
  });

  //cors
  let origin: string = null;
  koa.use(
    Cors({
      origin: (ctx: Koa.ParameterizedContext) => {
        let i = Config.domainWhiteList.indexOf(ctx.header.origin); //域名白名单
        origin = Config.domainWhiteList[i];
        return Config.domainWhiteList[i];
      },
      ...Config.cors
    })
  );

  //compress
  koa.use(Compress());

  //bodyparser
  koa.use(Bodyparser());

  //static
  koa.use(Static(join(__dirname, '../resources/static')));

  //socket
  socketServer.init(server, origin);

  //timer
  await Timer.start();

  //router
  Router(koa);

  //listen
  server.listen(Config.port, () => {
    console.log(
      `[success] http://127.0.0.1:${
        Config.port
      } ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`
    );
  });
})();
