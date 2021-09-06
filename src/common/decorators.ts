/**
 * 协议类型
 */
type ProtocolType = 'HTTP' | 'SOCKET';

/**
 * 请求方法
 */
type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTION' | 'PATCH';

/**
 * 注册结构
 */
export interface Routes {
  path?: string;
  protocol?: ProtocolType;
  method?: RequestMethod;
  middleware?: Function[];
  handler?: Function;
  constructor?: any;
}

/**
 * 定义注册的路由数组
 */
export const routes: Routes[] = [];

/**
 * 给controller添加装饰
 * @param {*} path
 */
export function Controller(path: string = '') {
  return function (target: any) {
    target.prefix = path;
  };
}

/**
 * 给controller类的方法添加装饰
 * @param params Controllers
 */
export function RequestMapping(params: Routes = {}) {
  if (!params.protocol) params.protocol = 'HTTP';
  if (!params.method) params.method = 'GET';
  if (!params.middleware) params.middleware = [];
  return function (target: any, name: string) {
    if (!params.path) params.path = `/${name.toLocaleLowerCase()}`;
    routes.push({
      path: params.path,
      method: params.method,
      protocol: params.protocol,
      middleware: params.middleware,
      handler: target[name],
      constructor: target.constructor
    });
  };
}
