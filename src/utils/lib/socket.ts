import * as SocketIO from "socket.io";
import {isNull, restful} from './tool';
import Logger from "./logger";
import {tokenGet, tokenExpire} from './token';

export interface SocketClient extends SocketIO.Socket {
    userId?: number
}

export interface SocketCtx {
    clients: { [key: string]: SocketClient }, //客户端组
    key: string, //数据返回标识
    data?: unknown
}

export default class Socket {
    private io: SocketIO.Server;
    private router: unknown;
    private clients: { [key: string]: SocketClient } = {};

    constructor() {
    }

    //token刷新
    tokenRefresh() {
        setInterval(async () => {
            for (let i in this.clients) {
                if (this.clients[i]) await tokenExpire(this.clients[i].request._query.Authorization, 7200);
            }
        }, 1000 * 60 * 60);
    }

    //初始化
    init(io: SocketIO.Server, router: unknown) {
        this.io = io;
        this.router = router;
        this.tokenRefresh();
        this.io.on('connection', async (client: SocketClient) => {
            if (isNull(client.request._query.Authorization)) {
                client.send(restful.socketMsg({key: "socket-error", value: "Token为空"}));
                client.disconnect(true);
                return;
            }
            let userId = await tokenGet(client.request._query.Authorization) as string;
            if (isNull(userId)) {
                client.disconnect(true);
                return;
            }
            if (this.clients[userId]) {
                this.clients[userId].send(restful.socketMsg({key: "socket-error", value: "在新设备登录!"}));
                this.clients[userId].disconnect(true);
            }
            client.userId = Number(userId);
            this.clients[client.userId] = client;
            client.on('message', async data => {
                if (isNull(data)) {
                    client.send(restful.socketMsg({key: "socket-error", value: "参数为空!"}));
                    return;
                }
                try {
                    data = JSON.parse(data);
                } catch (e) {
                    client.send(restful.socketMsg({key: "socket-error", value: "参数错误!"}));
                    return;
                }
                if (!data.path || !data.result) {
                    client.send(restful.socketMsg({key: "socket-error", value: "参数错误!"}));
                    return;
                }
                let path = data.path.split('.');
                let ctx: SocketCtx = {
                    clients: this.clients, //客户端组
                    key: data.key,
                    data: data.data || null
                };
                this.router[path[0]][path[1]](client, ctx);
            });
            client.on('disconnect', async () => {
                console.log('close');
                delete this.clients[client.userId];
            });
            client.on('error', async err => {
                console.log('error');
                client.disconnect(true);
                Logger.error(err);
            });
            client.send(restful.socketMsg({key: "socket-init", value: "ok"}));
        });
    }
}
