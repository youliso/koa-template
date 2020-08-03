'use strict';
const _ = require('./original');

class socket {

    static getInstance() {
        if (!socket.instance) socket.instance = new socket();
        return socket.instance;
    }

    constructor() {

    }

    //获取用户信息
    async getUserIfo(Authorization) {
        try {
            let payload = _.crypto.decodeAse(Authorization);
            let {id} = JSON.parse(payload);
            let userInfo = await _._get('user_info', id);
            delete userInfo.pwd;
            return {...userInfo};
        } catch (e) {
            return null;
        }
    }

    //token刷新
    tokenRefresh() {
        setInterval(async () => {
            for (let i in this.clients) {
                let item = this.clients[i];
                if (item) item.socket.send({code: 11, data: _.crypto.token(item.id)});
            }
        }, 1000 * 60 * 90);
    }

    //初始化
    init(io, router) {
        this.io = io;
        this.router = router;
        this.clients = {};
        this.tokenRefresh();
        this.io.on('connection', async client => {
            if (_.isNull(client.request._query.Authorization)) {
                client.send(_.error('Token为空'));
                client.disconnect(true);
                return;
            }
            let userInfo = await this.getUserIfo(client.request._query.Authorization);
            if (!userInfo) {
                client.disconnect(true);
                return;
            }
            if (this.clients[userInfo.id]) {
                client.send(_.error('重复登录'));
                client.disconnect(true);
                return;
            }
            delete userInfo.pwd;
            userInfo.socket = client;
            this.clients[userInfo.id] = userInfo;
            client.on('message', async data => {
                console.log(data);
                if (!data) {
                    client.send(_.error('参数为空'));
                    return;
                }
                if (!data.path || !data.result) {
                    client.send(_.error('参数错误'));
                    return;
                }
                let path = data.path.split('.');
                let ctx = {
                    clients: this.clients, //客户端组
                    result: data.result,
                    data: data.data || null
                };
                this.router[path[0]][path[1]](client, ctx);
            });
            client.on('disconnect', async () => {
                console.log('close');
                delete this.clients[client.id];
            });
            client.on('error', async err => {
                console.log('error');
                client.disconnect(true);
                _.logger.error(err);
            });
        });
    }

}

module.exports = socket.getInstance();