import {restful, SOCKET_MSG_TYPE} from '../utils/lib/tool';
import {SocketClient, SocketCtx} from "../utils/lib/socket";

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
