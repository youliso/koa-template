import Router from '@/common/router';
import type { DefaultContext } from 'koa';
export default (app: DefaultContext) => Router(app);

/**
 * 注册控制器
 */
export * from '@/controllers/index';
