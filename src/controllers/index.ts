import { Next, ParameterizedContext } from 'koa';
import { RequestMethod, Controller, RequestMapping } from '@/decorators/http';

@Controller('/index')
export default class Index {
  @RequestMapping({
    url: '/test',
    method: RequestMethod.GET // 定义请求方法
  })
  async test(ctx: ParameterizedContext, next: Next) {
    ctx.body = 'test';
    await next();
  }
}
