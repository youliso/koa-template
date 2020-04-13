'use strict';
const _ = require('./original');
const {wsToken} = require('./token');

class ws {

    static getInstance() {
        if (!ws.instance) ws.instance = new ws();
        return ws.instance;
    }

    constructor() {
        this.clients = {}; //客户端组
        this.users = {}; //用户信息组
        this.count = 0; // 连接数量
        console.log('[ws]...');
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
            if (_.isNull(client.protocol)) {
                client.send(_.WsError('Token为空'));
                client.close();
                return;
            }
            let Req = await wsToken(client, client.protocol);
            if (!Req) {
                client.close();
                return;
            }
            client.id = Req.userInfo.id;
            if (this.clients[client.id]) {
                client.send(_.WsError('重复登录'));
                client.close();
                return;
            }
            this.clients[client.id] = client;
            this.users[client.id] = Req.userInfo;
            this.count++;
            client.on('message', async message => {
                try {
                    message = JSON.parse(message);
                } catch (e) {
                }
                if (!message || !message.path || !message.result) {
                    client.send(_.WsError('参数错误'));
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
                _.logger.application.error(err);
            });

            client.send(JSON.stringify({code: 11, time: new Date().getTime()}));
        });
    }

}

module.exports = ws.getInstance();