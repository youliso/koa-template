'use strict';
const original = require('../utils/original');

class home extends original {
    constructor() {
        super();
    }

    index(client, ctx) {
        let users = [];
        for (let i in ctx.users) {
            users.push(ctx.users[i].family);
        }
        ctx.broadcast(this.WsSuccess('ok', ctx.result, {test: "test"}));
    }

}

module.exports = new home();
