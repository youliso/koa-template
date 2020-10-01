import * as KRouter from 'koa-router';

class Router {
    public routerHttp: KRouter;
    public routerSocket = {};

    constructor() {
        this.routerHttp = new KRouter();
    }

    //router_http
    async http() {
        let List = [//http 请求对应路由 (/)
            {path: '/index', value: await import('./router_http/index')}
        ];
        let req = await Promise.all(List);
        req.forEach(e => {
            this.routerHttp.use(e.path, e.value.default.routes(), e.value.default.allowedMethods());
        })
        return this.routerHttp.routes();
    }

    //router_socket
    async socket() {
        let List = [//socket 对应路由 (.)
            {path: 'index', value: await import('./router_socket/index')}
        ];
        let req = await Promise.all(List);
        req.forEach(e => {
            this.routerSocket[e.path] = e.value.default;
        })
        return this.routerSocket;
    }

}

export default new Router();
