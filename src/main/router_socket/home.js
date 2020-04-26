'use strict';
const _ = require('../../resources/utils/original');

class home {
    index(client, ctx) {
        ctx.broadcast(_.WsSuccess('ok', ctx.result, {test: "test"}));
    }
}

module.exports = new home();
