import { Next, ParameterizedContext } from 'koa';
import { RequestMethod, Controller, RequestMapping, ProtocolType } from '@/common/decorators';
import { Success } from '@/common/restful';
import { SocketClient, SocketCtx } from '@/common/socket';

@Controller('/index')
class Index {
  @RequestMapping({
    method: RequestMethod.GET
  })
  async home(ctx: ParameterizedContext, next: Next) {
    ctx.body = Success('ok');
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
