'use strict';
const original = require('./original');
const {wsToken} = require('./token');

class ws extends original {
    constructor() {
        super();
        this.isFirst = true; //是否首次
        this.clients = {}; //客户端组
        this.users = {}; //用户信息组
        this.count = 0; // 连接数量
        this.tokenRefreshId = null; //token刷新Id
    }

    //token刷新
    tokenRefresh() {
        console.log('[WsTokenRefresh]初始化');
        this.tokenRefreshId = setInterval(async () => {
            for (let i in this.clients) {
                let Req = await wsToken(this.clients[i], this.clients[i].protocol);
                if (!Req) {
                    this.clients[i].close();
                    return;
                }
                this.clients[i].id = Req.userInfo.id;
                this.clients[this.clients[i].id] = this.clients[i];
                this.users[this.clients[i].id] = Req.userInfo;
                this.clients[i].send(JSON.stringify({code: 22, data: Req.token, time: new Date().getTime()}));
            }
        }, 1000 * 60 * 90);
    }

    //广播
    broadcast(data, noId) {
        noId = noId || 0;
        for (let i in this.clients) {
            if (Number(i) !== noId) this.clients[i].send(data);
        }
    }

    //初始化
    init(ws, router) {
        ws.on('connection', async client => {
            if (!client.protocol) {
                client.send(this.WsError('Token为空'));
                client.close();
                return;
            }
            let Req = await wsToken(client, client.protocol);
            if (!Req) {
                client.send(this.WsError('Token错误'));
                client.close();
                return;
            }
            client.id = Req.userInfo.id;
            if (this.clients[client.id]) {
                client.send(this.WsError('重复登录'));
                client.close();
                return;
            }
            this.clients[client.id] = client;
            this.users[client.id] = Req.userInfo;
            if (this.isFirst) this.tokenRefresh();
            this.isFirst = false;
            this.count++;
            client.on('message', async message => {
                try {
                    message = JSON.parse(message);
                } catch (e) {
                }
                if (!message || !message.path || !message.result) {
                    client.send(this.WsError('参数错误'));
                    return;
                }
                let path = message.path.split('.');
                let ctx = {
                    broadcast: this.broadcast,
                    clients: this.clients, //客户端组
                    users: this.users, //用户信息组
                    count: this.count, // 连接数量
                    result: message.result,
                    data: message.data || null
                };
                router[path[0]][path[1]](client, ctx);
            });

            client.on('close', async () => {
                this.count--;
                delete this.clients[client.id];
                delete this.users[client.id];
                let userList = [];
                for (let i in this.users) {
                    userList.push(this.users[i].family);
                }
                this.broadcast(userList, 'app-home.users');
            });

            client.on('error', async err => {
                this.logger.error(err);
            });

            client.send(JSON.stringify({code: 11, time: new Date().getTime()}));
        });
    }

}


module.exports = new ws().init;