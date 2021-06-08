import { SocketClient, SocketCtx } from '@/lib/socket';
import { Socket, SocketMapping } from '@/common/decorators/socket';

@Socket('/user')
export default class Index {
  @SocketMapping({
    url: '/test'
  })
  async test(client: SocketClient, ctx: SocketCtx) {
    console.log('socket test');
    client.send({
      key: 'socket-home',
      value: 'socket test'
    });
  }
}
