import { Controller, RequestMapping } from '@/common/decorators';
import { Success } from '@/common/restful';
import type { Next, DefaultContext } from 'koa';
import type { SocketClient, SocketCtx } from '@/common/socket';
import IndexServer from '@/servers';

const indexServer = new IndexServer();

@Controller('')
class Index {
  @RequestMapping({
    path: '/'
  })
  async index(ctx: DefaultContext, next: Next) {
    ctx.body = Success('ok');
    await indexServer.test();
    await next();
  }

  @RequestMapping({
    protocol: 'SOCKET'
  })
  async socket(client: SocketClient, ctx: SocketCtx) {
    console.log('socket test');
    client.send({
      key: 'socket-home',
      value: 'socket test'
    });
  }
}
