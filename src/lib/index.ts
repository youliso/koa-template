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
    type: SOCKET_MSG_TYPE;
    key: string;
    value?: unknown;
}

export enum SOCKET_MSG_TYPE {
    ERROR,
    SUCCESS,
    INIT,
    CLOSE
}

export class restful {
    constructor() {
    }

    static success(msg?: string, data?: unknown, time?: number) {
        let e: restfulOpt = {
            code: 200,
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
            code: 400,
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
