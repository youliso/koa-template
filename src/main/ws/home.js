'use strict';
const _ = require('../utils/original');

class home {
    constructor() {
    }

    index(client, ctx) {
        let users = [];
        for (let i in ctx.users) {
            users.push(ctx.users[i].family);
        }
        ctx.broadcast(_.WsSuccess('ok', ctx.result, {test: "test"}));
    }

}

module.exports = new home();
