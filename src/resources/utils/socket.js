'use strict';
const _ = require('./original');
const {sToken} = require('./token');

class socket {

    static getInstance() {
        if (!socket.instance) socket.instance = new socket();
        return socket.instance;
    }

    constructor() {
        this.clients = {}; //客户端组
        console.log('[socket]...');
    }

    //广播
    broadcast(data, noId) {
        noId = noId || 0;
        for (let i in this.clients) {
            if (Number(i) !== noId) this.clients[i].write(data);
        }
    }

    //初始化
    init(io, router) {
        io.on('connection', async client => {
            client.power = false;
            setTimeout(()=>{
                if(!client.power) client.end();
            },1000*60);
            client.on('data', async data => {
                try {
                    data = JSON.parse(data.toString());
                } catch (e) {
                    client.write(_.WsError('参数错误'));
                    return;
                }
                console.log(data);
                if (!data) {
                    client.write(_.WsError('参数错误'));
                    return;
                }
                if(data.code===0){
                    if (_.isNull(data.data)) {
                        client.write(_.WsError('Token为空'));
                        client.end();
                        return;
                    }
                    let Req = await sToken(client, data.data);
                    if (!Req) {
                        client.end();
                        return;
                    }
                    if (this.clients[Req.userInfo.id]) {
                        client.write(_.WsError('重复登录'));
                        client.end();
                        return;
                    }
                    client.id = Req.userInfo.id;
                    client.userInfo = Req.userInfo;
                    client.power = true;
                    return;
                }
                if (!data.path || !data.result) {
                    client.write(_.WsError('参数错误'));
                    return;
                }
                let path = data.path.split('.');
                let ctx = {
                    broadcast: this.broadcast,
                    clients: this.clients, //客户端组
                    result: data.result,
                    data: data.data || null
                };
                router[path[0]][path[1]](client, ctx);
            });
            client.on('close', async () => {
                console.log('close');
                delete this.clients[client.id];
            });
            client.on('error', async err => {
                console.log('error',err);
                client.end();
                _.logger.application.error(err);
            });
        });
    }

}

module.exports = socket.getInstance();