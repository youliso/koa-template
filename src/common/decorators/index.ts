import { isNull } from '@/utils';

/**
 * 协议类型
 */
export enum ProtocolType {
  HTTP,
  SOCKET
}

/**
 * 注册结构
 */
export interface Routes {
  path: string;
  protocol?: ProtocolType;
  method?: RequestMethod;
  middleware?: Function[];
  handler?: Function;
  constructor?: any;
}

/**
 * 请求方法
 */
export enum RequestMethod {
  GET = 'get',
  POST = 'post',
  PUT = 'pust',
  DELETE = 'delete',
  OPTION = 'option',
  PATCH = 'patch'
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
  return function(target: any) {
    target.prefix = path;
  };
}

/**
 * 给controller类的方法添加装饰
 * @param controllers Controllers
 */
export function RequestMapping(
  {
    path = '',
    protocol = ProtocolType.HTTP,
    method = RequestMethod.GET,
    middleware = []
  }: Routes
) {
  return function(target: any, name: string) {
    if (isNull(path)) path = `/${name.toLocaleLowerCase()}`;
    routes.push({
      path,
      method,
      protocol,
      middleware,
      handler: target[name],
      constructor: target.constructor
    });
  };
}
