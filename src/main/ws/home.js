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
        ctx.broadcast(users, 'app-home.users');
    }

}

let e = new home();
module.exports = {
    index: e.index
};
