import {Server, Socket as Io} from "socket.io";
import {isNull, restful, SOCKET_MSG_TYPE} from './tool';
import Logger from "./logger";
import {tokenGet, tokenExpire} from './token';

export interface SocketClient extends Io {
    userId?: number
}

export interface SocketCtx {
    clients: { [key: string]: SocketClient }, //客户端组
    key: string, //数据返回标识
    data?: unknown
}

class Socket {
    private static instance: Socket;
    private io: Server;
    private router: unknown;
    public clients: { [key: string]: SocketClient } = {};

    static getInstance() {
        if (!Socket.instance) Socket.instance = new Socket();
        return Socket.instance;
    }

    constructor() {
    }

    //token刷新
    tokenRefresh() {
        setInterval(async () => {
            for (let i in this.clients) {
                if (this.clients[i]) await tokenExpire(this.clients[i].handshake.query["authorization"], 7200);
            }
        }, 1000 * 60 * 60);
    }

    //初始化
    init(io: Server, router: unknown) {
        this.io = io;
        this.router = router;
        this.tokenRefresh();
        this.io.sockets.on('connection', async (client: SocketClient) => {
            if (isNull(client.handshake.query["authorization"])) {
                client.send(restful.socketMsg({
                    type: SOCKET_MSG_TYPE.ERROR,
                    key: null,
                    value: "Token为空!(10秒后程序将退出!)"
                }));
                client.disconnect(true);
                return;
            }
            let userId = await tokenGet(client.handshake.query["authorization"]) as string;
            if (isNull(userId)) {
                client.disconnect(true);
                return;
            }
            if (this.clients[userId]) {
                client.send(restful.socketMsg({
                    type: SOCKET_MSG_TYPE.ERROR,
                    key: null,
                    value: "账号已登录!(10秒后程序将退出!)"
                }));
                client.disconnect(true);
                return;
            }
            client.userId = Number(userId);
            this.clients[client.userId] = client;
            client.on('message', async data => {
                if (isNull(data)) {
                    client.send(restful.socketMsg({
                        type: SOCKET_MSG_TYPE.ERROR,
                        key: null,
                        value: "参数为空!(10秒后程序将退出!)"
                    }));
                    return;
                }
                try {
                    data = JSON.parse(data);
                } catch (e) {
                    client.send(restful.socketMsg({
                        type: SOCKET_MSG_TYPE.ERROR,
                        key: null,
                        value: "参数错误!(10秒后程序将退出!)"
                    }));
                    return;
                }
                if (!data.path || !data.result) {
                    client.send(restful.socketMsg({
                        type: SOCKET_MSG_TYPE.ERROR,
                        key: null,
                        value: "参数错误!(10秒后程序将退出!)"
                    }));
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
                Logger.info(`[socket-close] ${client.userId}`);
                delete this.clients[client.userId];
            });
            client.on('error', async err => {
                Logger.info(`[socket-error] ${client.userId}`);
                client.disconnect(true);
                Logger.error(err);
            });
            Logger.info(`[socket-init] ${client.userId} ${client.handshake.query["authorization"]}`);
            client.send(restful.socketMsg({
                type: SOCKET_MSG_TYPE.INIT,
                key: null,
                value: "ok"
            }));
        });
    }
}

export const Sockets = Socket.getInstance();
