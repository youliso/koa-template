import Cfg from '@/common/cfg';
import { Server as serverIo, Socket as socketIo } from 'socket.io';
import { io, Socket } from 'socket.io-client';
import { ManagerOptions } from 'socket.io-client/build/manager';
import { SocketOptions } from 'socket.io-client/build/socket';
import { isNull } from '@/utils';
import Log from '@/utils/log';
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
  public routers: { [key: string]: Function[] } = {};
  public clients: { [key: string]: SocketClient } = {};

  static getInstance() {
    if (!SocketServer.instance) SocketServer.instance = new SocketServer();
    return SocketServer.instance;
  }

  constructor() {
  }

  // 装载路由
  setRouters(routers: { [key: string]: Function[] }) {
    this.routers = routers;
  }

  // 初始化
  init(server: Http.Server) {
    const corsOpt = Cfg.get<{ [key: string]: any }>('index.cors');
    const domainWhiteList = Cfg.get<string[]>('index.domainWhiteList');
    this.io = new serverIo(server, {
      cors: {
        origin: (origin, callback) => {
          if (domainWhiteList.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
          } else {
            callback(new Error('Not allowed by CORS'));
          }
        },
        methods: corsOpt.allowMethods,
        allowedHeaders: corsOpt.allowHeaders,
        exposedHeaders: corsOpt.exposeHeaders
      },
      path: Cfg.get('socket.path'),
      serveClient: false,
      pingInterval: 10000,
      pingTimeout: 5000,
      cookie: false
    });

    this.io.sockets.on('connection', async (client: SocketClient) => {
      const authorization = client.handshake.auth['authorization'];
      if (isNull(authorization)) {
        client.send({
          type: SOCKET_MSG_TYPE.ERROR,
          value: 'Token为空'
        });
        client.disconnect(true);
        return;
      }
      const userId = authorization; //TODO 此处应判断凭证是否有效
      if (isNull(userId)) {
        client.send({
          type: SOCKET_MSG_TYPE.ERROR,
          value: 'Token无效'
        });
        client.disconnect(true);
        return;
      }
      if (this.clients[userId]) {
        client.send({
          type: SOCKET_MSG_TYPE.ERROR,
          value: '账号已登录'
        });
        client.disconnect(true);
        return;
      }
      client.userId = Number(userId);
      this.clients[client.userId] = client;
      client.conn.on('packetCreate', async (packet: any) => {
        if (packet.type === 'ping') {  // TODO token

        }
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
      client.on('message', async (data) => {
        if (isNull(data)) {
          client.send({
            type: SOCKET_MSG_TYPE.ERROR,
            value: '参数为空'
          });
          return;
        }
        try {
          data = JSON.parse(data);
        } catch (e) {
          client.send({
            type: SOCKET_MSG_TYPE.ERROR,
            value: '参数错误'
          });
          return;
        }
        if (!data.path) {
          client.send({
            type: SOCKET_MSG_TYPE.ERROR,
            value: '参数错误'
          });
          return;
        }
        let ctx: SocketCtx = {
          clients: this.clients, //客户端组
          key: data.key,
          data: data.data || null
        };
        for (let fun of this.routers[data.path]) fun(client, ctx);
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
