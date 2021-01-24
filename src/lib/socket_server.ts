import {Server as serverIo, Socket as socketIo} from "socket.io";
import {isNull} from './index';
import {SOCKET_MSG_TYPE} from "./restful";
import * as restful from './restful';
import Log from "./log";
import {tokenGet, tokenExpire} from './token';
import * as Http from "http";

const Config = require('../config/config.json');

export interface SocketClient extends socketIo {
    userId?: number
}

export interface SocketCtx {
    clients: { [key: string]: SocketClient }, //客户端组
    key: string, //数据返回标识
    data?: unknown
}

class SocketServer {
    private static instance: SocketServer;
    private io: serverIo;
    private router: unknown;
    public clients: { [key: string]: SocketClient } = {};

    static getInstance() {
        if (!SocketServer.instance) SocketServer.instance = new SocketServer();
        return SocketServer.instance;
    }

    constructor() {
    }

    //token刷新
    tokenRefresh() {
        setInterval(async () => {
            for (let i in this.clients) {
                if (this.clients[i]) await tokenExpire(this.clients[i].handshake.auth["authorization"], 7200);
            }
        }, 1000 * 60 * 60);
    }

    //初始化
    init(server: Http.Server, origin: string, router: unknown) {
        this.io = new serverIo(server, {
            cors: {
                origin,
                ...Config.cors
            } as any,
            path: Config.socketPath,
            serveClient: false,
            pingInterval: 10000,
            pingTimeout: 5000,
            cookie: false
        });
        this.router = router;
        this.tokenRefresh();
        this.io.sockets.on('connection', async (client: SocketClient) => {
            if (isNull(client.handshake.auth["authorization"])) {
                client.send(restful.socketMsg({
                    type: SOCKET_MSG_TYPE.ERROR,
                    key: null,
                    value: "Token为空!(10秒后程序将退出!)"
                }));
                client.disconnect(true);
                return;
            }
            let userId = await tokenGet(client.handshake.auth["authorization"]) as string;
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
                Log.info(`[socket-close] ${client.userId}`);
                delete this.clients[client.userId];
            });
            client.on('error', async err => {
                Log.info(`[socket-error] ${client.userId}`);
                client.disconnect(true);
                Log.error(err);
            });
            Log.info(`[socket-init] ${client.userId} ${client.handshake.auth["authorization"]}`);
            client.send(restful.socketMsg({
                type: SOCKET_MSG_TYPE.INIT,
                key: null,
                value: "ok"
            }));
        });
    }
}

export const socketServer = SocketServer.getInstance();
