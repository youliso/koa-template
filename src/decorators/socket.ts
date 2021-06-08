/**
 * 定义注册的路由数组
 */
export const sockets: {
  url: string;
  middleware: Function[];
  handler: Function;
  constructor: any;
}[] = [];

/**
 * 给socket添加装饰
 * @param {*} path
 */
export function Socket(path: string = '') {
  return function (target: any) {
    // 给controller类添加路由前缀
    target.prefix = path;
  };
}

/**
 * 给controller类的方法添加装饰
 * url 可选
 * method 请求方法
 * middleware 中间件
 */
export function SocketMapping({
  url = '',
  middleware = []
}: {
  url: string;
  middleware?: Function[];
}) {
  return function (target: any, name: string, descriptor: PropertyDescriptor) {
    let path = '';
    // 判断有没有定义url
    if (!url) {
      // 取方法名作为路径
      path = `/${name.toLocaleLowerCase()}`;
    } else {
      // 自己定义的url
      path = url;
    }
    // 创建router需要的数据 url，method，middleware（可以没有）,最终执行的方法，装饰器队对象的构造函数
    sockets.push({
      url: path,
      middleware: middleware,
      handler: target[name],
      constructor: target.constructor
    });
  };
}
