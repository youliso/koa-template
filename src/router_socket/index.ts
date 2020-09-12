import _ from '../utils/lib/original';
import {SocketClient, SocketCtx} from "../utils/lib/socket";

const index = {};

index['home'] = (client: SocketClient, ctx: SocketCtx) => {
    let data = {
        result: ctx.result,
        data: {test: 'test'}
    }
    client.broadcast.send(_.success('测试', data));
};

export default index;
