import { Next, ParameterizedContext } from 'koa';
import { RequestMethod, Controller, RequestMapping, ProtocolType } from '@/common/decorators';
import { IndexServer } from '@/servers';
import { SocketClient, SocketCtx } from '@/common/socket';

const indexServer = new IndexServer();

@Controller('/index')
class Index {

  @RequestMapping({
    path: '/test1',
    method: RequestMethod.GET
  })
  async test1(ctx: ParameterizedContext, next: Next) {
    indexServer.test();
    ctx.body = ctx.query;
    await next();
  }

  @RequestMapping({
    path: '/test2',
    protocol: ProtocolType.SOCKET
  })
  async test2(client: SocketClient, ctx: SocketCtx) {
    console.log('socket test');
    client.send({
      key: 'socket-home',
      value: 'socket test'
    });
  }
}
