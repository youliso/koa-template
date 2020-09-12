import * as KRouter from 'koa-router';

class Router {
    public routerHttp: KRouter;
    public routerSocket = {};

    constructor() {
        this.routerHttp = new KRouter();
    }

    //router_http
    async http() {
        let index = await import('./router_http/index');


        this.routerHttp.use('/index', index.default.routes(), index.default.allowedMethods());
        return this.routerHttp.routes();
    }

    //router_socket
    async socket() {
        let index = await import('./router_socket/index');


        this.routerSocket['index'] = index.default;
        return this.routerSocket;
    }

}

export default new Router();
