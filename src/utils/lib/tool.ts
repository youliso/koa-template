export function isNull(o: unknown) {
    return o == undefined || o == 'undefined' || o == null || o == 'null' || o == '';
}

interface restfulOpt {
    code: number,
    msg?: string,
    time?: number,
    data?: unknown
}

interface socketMsgOpt {
    type: SocketMsgType;
    key: string;
    value?: unknown;
}

export enum SocketMsgType {
    SOCKET_ERROR,
    SOCKET_SUCCESS,
    SOCKET_INIT,
    SOCKET_CLOSE
}

export class restful {
    constructor() {
    }

    static success(msg?: string, data?: unknown, time?: number) {
        let e: restfulOpt = {
            code: 0,
            msg: "success",
            time: new Date().getTime(),
            data
        };
        if (time) e.time = time;
        if (msg) e.msg = msg;
        return e;
    }

    static error(msg?: string, data?: unknown, time?: number) {
        let e: restfulOpt = {
            code: -1,
            msg: "error",
            time: new Date().getTime(),
            data
        };
        if (time) e.time = time;
        if (msg) e.msg = msg;
        return e;
    }

    static socketMsg(data: socketMsgOpt) {
        return data;
    }

}
