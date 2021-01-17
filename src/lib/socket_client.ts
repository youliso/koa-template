import {io, Socket} from "socket.io-client";
import {ManagerOptions} from "socket.io-client/build/manager";
import {SocketOptions} from "socket.io-client/build/socket";

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
        auth: {},
    };

    constructor() {
    }

    /**
     * 打开通讯
     * @param url
     * @param callback
     */
    open(url: string, callback: Function) {
        this.io = io(url, this.opts);
        this.io.on("connect", () => {
            console.log("[Socket]connect");
        });
        this.io.on("disconnect", () => {
            console.log("[Socket]disconnect");
            setTimeout(() => {
                if (this.io && this.io.io._readyState === "closed") this.io.open();
            }, 1000 * 60 * 3)
        });
        this.io.on("data", (data: any) => {

            console.log(data)
            callback(data)
        });
        this.io.on("message", (data: any) => {
            console.log(data)
            callback(data)
        });
        this.io.on("error", (data: any) => console.log(`[Socket]error ${data.toString()}`));
        this.io.on("close", () => console.log("[Socket]close"));
    }

    /**
     * 重新连接
     */
    reconnection() {
        if (this.io && this.io.io._readyState === "closed") this.io.open();
    }

    /**
     * 关闭
     */
    close() {
        if (this.io && this.io.io._readyState !== "closed") this.io.close();
    }
}
