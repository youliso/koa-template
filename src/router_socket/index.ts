import {restful} from '../utils/lib/tool';
import {SocketClient, SocketCtx} from "../utils/lib/socket";

const index = {};

index['home'] = (client: SocketClient, ctx: SocketCtx) => {
    let data = {
        key: ctx.key,
        data: {test: 'test'}
    }
    client.send(restful.success("测试", data));
};

export default index;
