import {restful, SOCKET_MSG_TYPE} from '../lib';
import {SocketClient, SocketCtx} from "../lib/socket_server";

const index = {};

index['home'] = (client: SocketClient, ctx: SocketCtx) => {
    let data = {
        key: ctx.key,
        data: {test: 'test'}
    }
    client.send(restful.socketMsg({
        type: SOCKET_MSG_TYPE.SUCCESS,
        key: "socket-home",
        value: data
    }));
};

export default index;
