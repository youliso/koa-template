import Cfg from '@/common/cfg';
import { Server as serverIo, Socket as socketIo } from 'socket.io';
import { io, Socket } from 'socket.io-client';
import { ManagerOptions } from 'socket.io-client/build/manager';
import { SocketOptions } from 'socket.io-client/build/socket';
import { isNull } from './index';
import Log from './log';
import * as Http from 'http';

export interface SocketClient extends socketIo {
  userId?: number;
}

export interface SocketCtx {
  clients: { [key: string]: SocketClient }; //客户端组
  key: string; //数据返回标识
  data?: unknown;
}

export enum SOCKET_MSG_TYPE {
  ERROR,
  SUCCESS,
  INIT,
  CLOSE
}

class SocketServer {
  private static instance: SocketServer;
  private io: serverIo;
  public clients: { [key: string]: SocketClient } = {};

  static getInstance() {
    if (!SocketServer.instance) SocketServer.instance = new SocketServer();
    return SocketServer.instance;
  }

  constructor() {}

  //token刷新
  tokenRefresh() {
    setInterval(async () => {
      for (let i in this.clients) {
        if (this.clients[i]) {
          //TODO
        }
      }
    }, 1000 * 60 * 60);
  }

  //初始化
  init(server: Http.Server, origin: string) {
    this.io = new serverIo(server, {
      cors: {
        origin,
        ...Cfg.get('index.cors')
      } as any,
      path: Cfg.get('index.socketPath'),
      serveClient: false,
      pingInterval: 10000,
      pingTimeout: 5000,
      cookie: false
    });
  }

  start(routers: { [key: string]: Function[] }) {
    this.tokenRefresh();
    this.io.sockets.on('connection', async (client: SocketClient) => {
      if (isNull(client.handshake.auth['authorization'])) {
        client.send({
          type: SOCKET_MSG_TYPE.ERROR,
          value: 'Token为空!(10秒后程序将退出!)'
        });
        client.disconnect(true);
        return;
      }
      let userId = ''; //TODO
      if (isNull(userId)) {
        client.disconnect(true);
        return;
      }
      if (this.clients[userId]) {
        client.send({
          type: SOCKET_MSG_TYPE.ERROR,
          value: '账号已登录!(10秒后程序将退出!)'
        });
        client.disconnect(true);
        return;
      }
      client.userId = Number(userId);
      this.clients[client.userId] = client;
      client.on('message', async (data) => {
        if (isNull(data)) {
          client.send({
            type: SOCKET_MSG_TYPE.ERROR,
            value: '参数为空!(10秒后程序将退出!)'
          });
          return;
        }
        try {
          data = JSON.parse(data);
        } catch (e) {
          client.send({
            type: SOCKET_MSG_TYPE.ERROR,
            value: '参数错误!(10秒后程序将退出!)'
          });
          return;
        }
        if (!data.path) {
          client.send({
            type: SOCKET_MSG_TYPE.ERROR,
            value: '参数错误!(10秒后程序将退出!)'
          });
          return;
        }
        let ctx: SocketCtx = {
          clients: this.clients, //客户端组
          key: data.key,
          data: data.data || null
        };
        for (let fun of routers[data.path]) fun(client, ctx);
      });
      client.on('disconnect', async () => {
        Log.info(`[socket-close] ${client.userId}`);
        delete this.clients[client.userId];
      });
      client.on('error', async (err) => {
        Log.info(`[socket-error] ${client.userId}`);
        client.disconnect(true);
        Log.error(err);
      });
      Log.info(`[socket-init] ${client.userId} ${client.handshake.auth['authorization']}`);
      client.send({
        type: SOCKET_MSG_TYPE.INIT,
        value: 'ok'
      });
    });
  }
}

export const socketServer = SocketServer.getInstance();

/**
 * Socket模块
 * */
export class SocketClient {
  public io: Socket;

  /**
   * socket.io参数
   * 参考 ManagerOptions & SocketOptions
   * url https://socket.io/docs/v3/client-api/#new-Manager-url-options
   */
  public opts: Partial<ManagerOptions & SocketOptions> = {
    auth: {}
  };

  constructor(opts: Partial<ManagerOptions & SocketOptions>) {
    this.opts = opts || {
      auth: {}
    };
  }

  /**
   * 打开通讯
   * @param url
   * @param callback
   */
  open(url: string, callback: Function) {
    this.io = io(url, this.opts);
    this.io.on('connect', () => {
      console.log('[Socket]connect');
    });
    this.io.on('disconnect', () => {
      console.log('[Socket]disconnect');
      setTimeout(() => {
        if (this.io && this.io.io._readyState === 'closed') this.io.open();
      }, 1000 * 60 * 3);
    });
    this.io.on('data', (data: any) => {
      console.log(data);
      callback(data);
    });
    this.io.on('message', (data: any) => {
      console.log(data);
      callback(data);
    });
    this.io.on('error', (data: any) => console.log(`[Socket]error ${data.toString()}`));
    this.io.on('close', () => console.log('[Socket]close'));
  }

  /**
   * 重新连接
   */
  reconnection() {
    if (this.io && this.io.io._readyState === 'closed') this.io.open();
  }

  /**
   * 关闭
   */
  close() {
    if (this.io && this.io.io._readyState !== 'closed') this.io.close();
  }
}
