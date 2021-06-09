import { Next, ParameterizedContext } from 'koa';
import { RequestMethod, Controller, RequestMapping } from '@/common/decorators/http';
import { IndexServer } from '@/servers';

const indexServer = new IndexServer();
@Controller('/index')
class Index {
  @RequestMapping({
    url: '/test',
    method: RequestMethod.GET // 定义请求方法
  })
  async test(ctx: ParameterizedContext, next: Next) {
    indexServer.test();
    ctx.body = ctx.query;
    await next();
  }
}
