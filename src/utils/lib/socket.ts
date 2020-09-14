import * as SocketIO from "socket.io";
import _ from './tool';
import Logger from "./logger";
import Crypto from './crypto';

export interface SocketClient extends SocketIO.Socket {
    userInfo?: unknown
}

export interface SocketCtx {
    clients: { [key: string]: SocketClient }, //客户端组
    result: string,
    data?: unknown
}

export default class Socket {
    private io: SocketIO.Server;
    private router: unknown;
    private clients: { [key: string]: SocketClient } = {};

    constructor() {
    }

    //获取用户信息
    async getUserIfo(Authorization: string) {
        try {
            let payload = Crypto.decodeAse(Authorization);
            let {id} = JSON.parse(payload);
            let userInfo = await _._get('account', id);
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
                if (item) item.send({code: 11, data: Crypto.token(Number(i))});
            }
        }, 1000 * 60 * 90);
    }

    //初始化
    init(io: SocketIO.Server, router: unknown) {
        this.io = io;
        this.router = router;
        this.tokenRefresh();
        this.io.on('connection', async (client: SocketClient) => {
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
                this.clients[userInfo.id].send(_.error('在新设备登录!'));
                this.clients[userInfo.id].disconnect(true);
            }
            delete userInfo.pwd;
            client.userInfo = userInfo;
            this.clients[userInfo.id] = client;
            client.on('message', async data => {
                if (!data) {
                    client.send(_.error('参数为空'));
                    return;
                }
                try {
                    data = JSON.parse(data);
                } catch (e) {
                    client.send(_.error('参数错误'));
                    return;
                }
                if (!data.path || !data.result) {
                    client.send(_.error('参数错误'));
                    return;
                }
                let path = data.path.split('.');
                let ctx: SocketCtx = {
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
                Logger.error(err);
            });
            client.send({msg: 'init', code: 11, time: new Date().getTime()});
        });
    }
}
